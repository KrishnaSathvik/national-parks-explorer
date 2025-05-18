import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import { useToast } from "../context/ToastContext";

const EventsManager = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "events"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEvents(data);
    } catch (err) {
      console.error("Failed to fetch events", err);
      showToast("❌ Failed to load events", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      const refresh = httpsCallable(functions, "cacheNPSEvents");
      await refresh();
      showToast("✅ Events refreshed from NPS API!", "success");
      fetchEvents();
    } catch (err) {
      console.error("Refresh failed", err);
      showToast("❌ Failed to refresh events", "error");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-pink-600">
          📆 Manage Park Events
        </h1>
        <button
          onClick={handleRefresh}
          className="bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium px-5 py-2 rounded-full shadow transition"
        >
          🔁 Refresh NPS Events
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">⏳ Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-center text-gray-400">🚫 No events found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow border">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Park</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{event.title}</td>
                  <td className="p-4 text-gray-700">{event.parkName}</td>
                  <td className="p-4 text-gray-500">
                    {event.date || event.startDate || "N/A"}
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
