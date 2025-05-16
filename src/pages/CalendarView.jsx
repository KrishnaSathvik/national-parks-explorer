import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { ToastContainer } from "react-toastify"; // ✅ this line
import "react-toastify/dist/ReactToastify.css";
import SkeletonLoader from "../components/SkeletonLoader";
import { showToast } from "../components/showToast"; // adjust path if needed



const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPark, setSelectedPark] = useState("All");
  const [savedEventIds, setSavedEventIds] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      const snapshot = await getDoc(doc(db, "cache", "events"));
      if (snapshot.exists()) {
        const data = snapshot.data();
        setLastUpdated(data.updatedAt);
        const parsed = data.events.map((e) => ({
          ...e,
          start: e.start ? new Date(e.start) : new Date(),
          end: e.end ? new Date(e.end) : new Date(e.start),
        }));
        setEvents(parsed.sort((a, b) => a.start - b.start));
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchSavedEvents = async () => {
      if (!currentUser) return;
      const docSnap = await getDoc(doc(db, "users", currentUser.uid));
      if (docSnap.exists()) {
        setSavedEventIds(docSnap.data().favoriteEvents || []);
      }
    };
    fetchSavedEvents();
  }, [currentUser]);

  const toggleEventSave = async (eventObj) => {
    if (!currentUser) {
      showToast("🔐 Please log in to save events", "info");
      return;
    }

    const userRef = doc(db, "users", currentUser.uid);
    const eventPayload = {
      ...eventObj,
      start: eventObj.start.toISOString(),
      end: eventObj.end.toISOString(),
    };

    const alreadySaved = savedEventIds.includes(eventObj.id);

    await updateDoc(userRef, {
      favoriteEvents: alreadySaved
        ? arrayRemove(eventPayload) // 👈 must match structure
        : arrayUnion(eventPayload),
    });

    setSavedEventIds((prev) =>
      alreadySaved ? prev.filter((id) => id !== eventObj.id) : [...prev, eventObj.id]
    );

    showToast(
      alreadySaved ? "❌ Removed from saved events" : "💾 Event saved",
      alreadySaved ? "info" : "success"
    );
  };
  const selectedISODate = selectedDate.toLocaleDateString("en-CA");

  const filteredEvents = events.filter((e) => {
    const iso = e.start.toLocaleDateString("en-CA");
    return iso === selectedISODate && (selectedPark === "All" || e.park === selectedPark);
  });

  const monthlyEventMap = events.reduce((acc, event) => {
    const date = event.start.toLocaleDateString("en-CA");
    acc[date] = acc[date] || { count: 0, parks: new Set() };
    acc[date].count++;
    acc[date].parks.add(event.park);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 font-sans">
      <ToastContainer />
      <button
        onClick={() => navigate("/")}
        className="text-pink-600 hover:underline text-sm mb-6 inline-block"
      >
        ← Back to Parks
      </button>

      <h1 className="text-3xl font-bold text-center mb-2 text-pink-600">
        🗓️ National Park Events
      </h1>

      {lastUpdated && (
        <p className="text-sm text-center text-gray-500 mb-8">
          🔄 Last updated: {new Date(lastUpdated).toLocaleString()}
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Filters */}
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
              {[...new Set(events.map((e) => e.park))].sort().map((park) => (
                <option key={park}>{park}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              📅 Pick a Date
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              className="w-full border px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              minDate={new Date()}
            />
          </div>
        </div>

        {/* Monthly Heatmap */}
        <div>
          <h2 className="text-md font-bold mb-3 text-center">🔥 Monthly Heatmap</h2>
          <div className="grid grid-cols-7 gap-2 text-xs text-center">
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const date = new Date(selectedDate);
              date.setDate(day);
              const iso = date.toLocaleDateString("en-CA");
              const data = monthlyEventMap[iso];
              const count = data?.count || 0;
              const parkCount = data?.parks?.size || 0;

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
                  className={`p-2 rounded-lg cursor-pointer ${bg} hover:ring-2 hover:ring-pink-400 transition`}
                  onClick={() => setSelectedDate(date)}
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
          {/* Filters skeleton */}
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-4">
              <SkeletonLoader type="line" count={2} />
            </div>
            <div>
              <SkeletonLoader type="box" count={1} />
            </div>
          </div>

          {/* Daily events skeleton */}
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">
            📍 Events on {selectedDate.toDateString()}
          </h2>
          <SkeletonLoader type="card" count={3} />
        </>
      ) : filteredEvents.length === 0 ? (
        <p className="text-red-500">No events found for this date.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow hover:shadow-md border border-gray-100 p-6 relative transition"
            >
              <h3 className="text-lg font-semibold text-pink-600 mb-1">{event.title}</h3>
              <p className="text-sm text-gray-600">📍 {event.park}</p>
              <p className="text-sm text-gray-600">
                🗓️ {event.start.toDateString()} | 🕒{" "}
                {event.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>

              <button
                onClick={() => toggleEventSave(event)}
                className={`absolute top-3 right-3 text-lg ${
                  currentUser ? "text-blue-600 hover:scale-110" : "opacity-40 cursor-not-allowed"
                } transition`}
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
                  🔗{" "}
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-800"
                  >
                    Official Event Link
                  </a>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarView;
