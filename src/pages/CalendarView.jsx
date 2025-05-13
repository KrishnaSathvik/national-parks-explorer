// 📅 CalendarView.jsx — Final Version with Bug Fixes & Enhancements
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
        const data = docSnap.data();
        setSavedEventIds(data.favoriteEvents || []);
      }
    };
    fetchSavedEvents();
  }, [currentUser]);

  const toggleEventSave = async (eventObj) => {
    if (!currentUser) {
      toast.info("Please log in to save events");
      return;
    }
    const userRef = doc(db, "users", currentUser.uid);
    const alreadySaved = savedEventIds.includes(eventObj.id);
    await updateDoc(userRef, {
      favoriteEvents: alreadySaved ? arrayRemove(eventObj.id) : arrayUnion(eventObj.id),
    });
    setSavedEventIds((prev) =>
      alreadySaved ? prev.filter((id) => id !== eventObj.id) : [...prev, eventObj.id]
    );
    toast.success(alreadySaved ? "Removed from saved events" : "Event saved successfully");
  };

  const selectedISODate = selectedDate.toLocaleDateString("en-CA");

  const filteredEvents = events.filter((e) => {
    if (!e.start || isNaN(e.start)) return false;
    const eventISODate = e.start.toLocaleDateString("en-CA");
    const matchesDate = eventISODate === selectedISODate;
    const matchesPark = selectedPark === "All" || e.park === selectedPark;
    return matchesDate && matchesPark;
  });

  const monthlyEventMap = events.reduce((acc, event) => {
    const date = event.start.toLocaleDateString("en-CA");
    acc[date] = acc[date] || { count: 0, parks: new Set() };
    acc[date].count++;
    acc[date].parks.add(event.park);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans">
      <ToastContainer />
      <button
        onClick={() => navigate("/")}
        className="mb-4 text-blue-600 hover:underline text-sm"
      >
        ← Back to Parks
      </button>

      <h1 className="text-3xl font-bold mb-4 text-center">National Park Events by Date</h1>

      {lastUpdated && (
        <p className="text-sm text-center text-gray-500 mb-6">
          🕒 Last updated: {new Date(lastUpdated).toLocaleString()}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 items-start">
        <div className="space-y-6">
          <div>
            <label className="text-sm font-semibold block mb-1">🔎 Filter by Park:</label>
            <select
              value={selectedPark}
              onChange={(e) => setSelectedPark(e.target.value)}
              className="border px-3 py-2 rounded text-sm w-full"
            >
              <option>All</option>
              {[...new Set(events.map((e) => e.park))].sort().map((park) => (
                <option key={park}>{park}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">📅 Pick a Date:</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              className="border px-3 py-2 rounded text-sm w-full"
              minDate={new Date()}
            />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-md font-bold mb-2">🔥 Monthly Heatmap Overview</h2>
          <div className="grid grid-cols-7 gap-1 text-xs">
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const date = new Date(selectedDate);
              date.setDate(day);
              const iso = date.toLocaleDateString("en-CA");
              const data = monthlyEventMap[iso];
              const count = data?.count || 0;
              const parkCount = data?.parks?.size || 0;
              const bg = count >= 10 ? "bg-red-400" : count >= 5 ? "bg-orange-300" : count > 0 ? "bg-yellow-200" : "bg-gray-100";

              return (
                <div
                  key={day}
                  className={`p-2 rounded ${bg} cursor-pointer`}
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
        📅 Events on {selectedDate.toDateString()}
      </h2>

      {loading ? (
        <p className="text-gray-600">Loading events...</p>
      ) : filteredEvents.length === 0 ? (
        <p className="text-red-500">No events found for this date.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl border border-blue-100 shadow p-5 relative"
            >
              <h3 className="text-xl font-semibold text-blue-700 mb-1">
                {event.title}
              </h3>
              <p className="text-sm text-gray-600">📍 {event.park}</p>
              <p className="text-sm text-gray-600">
                🗓️ {event.start.toDateString()} | 🕒 {event.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
              <button
                onClick={() => toggleEventSave(event)}
                className={`absolute top-2 right-2 text-xl ${currentUser ? "hover:scale-110" : "opacity-40 cursor-not-allowed"}`}
              >
                {savedEventIds.includes(event.id) ? "💾" : "➕"}
              </button>
              <div
                className="text-gray-700 text-sm mt-4"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description || "No description available.") }}
              />
              {event.url && (
                <p className="text-sm text-blue-600 mt-4">
                  🔗 <a href={event.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">
                    Go to this link for more event information
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
