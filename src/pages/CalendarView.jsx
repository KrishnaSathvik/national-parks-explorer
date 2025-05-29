import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useIsMobile from "../hooks/useIsMobile";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SkeletonLoader from "../components/SkeletonLoader";
import { showToast } from "../components/showToast";

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [savedEventIds, setSavedEventIds] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPark, setSelectedPark] = useState("All");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchEvents = async () => {
      const snapshot = await getDoc(doc(db, "cache", "events"));
      if (snapshot.exists()) {
        const { updatedAt, events: rawEvents } = snapshot.data();
        setLastUpdated(updatedAt);
        const parsed = rawEvents.map((e) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end || e.start),
        }));
        setEvents(parsed.sort((a, b) => a.start - b.start));
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const fetchUserEvents = async () => {
      const docSnap = await getDoc(doc(db, "users", currentUser.uid));
      if (docSnap.exists()) {
        setSavedEventIds(docSnap.data().favoriteEvents || []);
      }
    };
    fetchUserEvents();
  }, [currentUser]);

  const toggleEventSave = async (event) => {
    if (!currentUser) {
      showToast("🔐 Please log in to save events", "info");
      return;
    }

    const userRef = doc(db, "users", currentUser.uid);
    const formattedEvent = {
      ...event,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
    };

    const alreadySaved = savedEventIds.includes(event.id);
    await updateDoc(userRef, {
      favoriteEvents: alreadySaved
        ? arrayRemove(formattedEvent)
        : arrayUnion(formattedEvent),
    });

    setSavedEventIds((prev) =>
      alreadySaved
        ? prev.filter((id) => id !== event.id)
        : [...prev, event.id]
    );

    showToast(
      alreadySaved ? "❌ Removed from saved events" : "💾 Event saved",
      alreadySaved ? "info" : "success"
    );
  };

  const selectedISO = selectedDate.toLocaleDateString("en-CA");
  const filteredEvents = useMemo(
    () =>
      events.filter(
        (e) =>
          e.start.toLocaleDateString("en-CA") === selectedISO &&
          (selectedPark === "All" || e.park === selectedPark)
      ),
    [events, selectedDate, selectedPark]
  );

  const monthlyHeatmap = useMemo(() => {
    return events.reduce((acc, e) => {
      const iso = e.start.toLocaleDateString("en-CA");
      acc[iso] = acc[iso] || { count: 0, parks: new Set() };
      acc[iso].count += 1;
      acc[iso].parks.add(e.park);
      return acc;
    }, {});
  }, [events]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-pink-100 py-12 px-4 font-sans">
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        {!isMobile && (
          <button
            onClick={() => navigate("/")}
            className="text-pink-600 hover:underline text-sm mb-6 inline-block"
          >
            ← Back to Parks
          </button>
        )}
        <div className="bg-white/80 backdrop-blur-md border border-white p-6 sm:p-10 rounded-3xl shadow-xl">
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-center mb-4 text-pink-600">
            🗓️ National Park Events
          </h1>

          {lastUpdated && (
            <p className="text-sm text-center text-gray-500 mb-8">
              🔄 Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}

          <div className="flex flex-col md:flex-row gap-8 mb-10">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  🔎 Filter by Park
                </label>
                <select
                  value={selectedPark}
                  onChange={(e) => setSelectedPark(e.target.value)}
                  className="w-full border px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                  <option>All</option>
                  {[...new Set(events.map((e) => e.park))].sort().map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  📅 Pick a Date
                </label>
                <DatePicker
                  selected={selectedDate}
                  onChange={setSelectedDate}
                  className="w-full border px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  minDate={new Date()}
                />
              </div>
            </div>

            <div>
              <h2 className="text-md font-bold mb-3 text-center">🔥 Monthly Heatmap</h2>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-xs text-center">
                {Array.from({ length: 31 }, (_, i) => {
                  const day = i + 1;
                  const date = new Date(selectedDate);
                  date.setDate(day);
                  const iso = date.toLocaleDateString("en-CA");
                  const data = monthlyHeatmap[iso];
                  const count = data?.count || 0;
                  const parkCount = data?.parks.size || 0;

                  const bg =
                    count >= 10
                      ? "bg-red-400"
                      : count >= 5
                      ? "bg-orange-300"
                      : count > 0
                      ? "bg-yellow-200"
                      : "bg-gray-100";

                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDate(date)}
                      className={`p-2 rounded-lg cursor-pointer ${bg} hover:ring-2 hover:ring-pink-400 transition`}
                    >
                      <div className="font-semibold">{day}</div>
                      <div>{count} evt</div>
                      <div className="text-[10px] text-gray-700">{parkCount} parks</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4 border-b pb-2">
            📍 Events on {selectedDate.toDateString()}
          </h2>

          {loading ? (
            <>
              <div className="grid md:grid-cols-2 gap-8 mb-10">
                <SkeletonLoader type="line" count={2} />
                <SkeletonLoader type="box" count={1} />
              </div>
              <SkeletonLoader type="card" count={3} />
            </>
          ) : filteredEvents.length === 0 ? (
            <p className="text-red-500">No events found for this date.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl shadow hover:shadow-md border border-gray-100 p-5 sm:p-6 relative transition"
                >
                  <h3 className="text-lg font-semibold text-pink-600 mb-1">{event.title}</h3>
                  <p className="text-sm text-gray-600">📍 {event.park}</p>
                  <p className="text-sm text-gray-600">
                    🗓️ {event.start.toDateString()} | 🕒 {event.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>

                  <button
                    onClick={() => toggleEventSave(event)}
                    className={`absolute top-3 right-3 text-lg ${currentUser ? "text-blue-600 hover:scale-110" : "opacity-40 cursor-not-allowed"} transition`}
                    title={
                      currentUser
                        ? savedEventIds.includes(event.id)
                          ? "Remove from saved"
                          : "Save this event"
                        : "Login required"
                    }
                  >
                    {savedEventIds.includes(event.id) ? "💾" : "➕"}
                  </button>

                  <div
                    className="text-sm text-gray-700 mt-3"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(event.description || "No description available."),
                    }}
                  />

                  {event.url && (
                    <p className="text-sm text-blue-600 mt-4">
                      🔗 <a href={event.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">Official Event Link</a>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;