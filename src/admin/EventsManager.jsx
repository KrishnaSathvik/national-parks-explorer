// ✅ Polished EventsManager.jsx with soft UI upgrades
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import axios from "axios";

const EventsManager = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPark, setSelectedPark] = useState("All");
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const fetchCachedEvents = async () => {
      try {
        const docRef = doc(db, "cache", "events");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setEvents(data.events || []);
          setLastUpdated(data.updatedAt || "");
        } else {
          console.warn("⚠️ cache/events document not found.");
        }
      } catch (error) {
        console.error("❌ Error fetching cached events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCachedEvents();
  }, []);

  const handleRefresh = async () => {
    const confirmed = window.confirm("Re-fetch and overwrite all cached NPS events?");
    if (!confirmed) return;

    try {
      await axios.get("https://cachenpsevents-wqrkpofo6a-uc.a.run.app");
      alert("✅ Events refreshed!");
      window.location.reload();
    } catch (error) {
      console.error("Refresh failed:", error);
      alert("❌ Failed to refresh events.");
    }
  };

  const parks = Array.from(new Set(events.map((e) => e.park))).sort();
  const filteredEvents =
    selectedPark === "All" ? events : events.filter((e) => e.park === selectedPark);

  return (
    <div className="p-6 bg-gradient-to-br from-white via-pink-50 to-pink-100 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-pink-700">🎪 Events Manager</h1>
        <button
          onClick={handleRefresh}
          className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2 rounded-full shadow-md"
        >
          🔁 Refresh Events
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : "Unknown"}
      </p>

      <select
        value={selectedPark}
        onChange={(e) => setSelectedPark(e.target.value)}
        className="mb-6 p-3 border border-gray-300 rounded-full w-full max-w-xs bg-white shadow-sm"
      >
        <option value="All">All Parks</option>
        {parks.map((park) => (
          <option key={park} value={park}>
            {park}
          </option>
        ))}
      </select>

      {loading ? (
        <p className="text-gray-500">Loading events...</p>
      ) : filteredEvents.length === 0 ? (
        <p className="text-gray-500">No events found.</p>
      ) : (
        <div className="overflow-x-auto bg-white/90 backdrop-blur-md rounded-2xl shadow">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Park</th>
                <th className="p-4">Start</th>
                <th className="p-4">End</th>
                <th className="p-4">Link</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{event.title}</td>
                  <td className="p-4 text-gray-600">{event.park}</td>
                  <td className="p-4 text-gray-500">{event.start}</td>
                  <td className="p-4 text-gray-500">{event.end}</td>
                  <td className="p-4">
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:underline"
                    >
                      🔗 View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EventsManager;
