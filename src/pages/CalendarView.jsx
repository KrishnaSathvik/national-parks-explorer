// Updated CalendarView.jsx with calendar date picker
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const NPS_API_KEY = "***REMOVED***";

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPark, setSelectedPark] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllEvents = async () => {
      const parkCodes = [
  "acad", // Acadia
  "arch", // Arches
  "badl", // Badlands
  "bibe", // Big Bend
  "bisc", // Biscayne
  "blca", // Black Canyon of the Gunnison
  "brca", // Bryce Canyon
  "cany", // Canyonlands
  "care", // Capitol Reef
  "cave", // Carlsbad Caverns
  "chis", // Channel Islands
  "cong", // Congaree
  "crla", // Crater Lake
  "cuva", // Cuyahoga Valley
  "dena", // Denali
  "drto", // Dry Tortugas
  "ever", // Everglades
  "gaar", // Gates of the Arctic
  "glba", // Glacier Bay
  "glac", // Glacier
  "grca", // Grand Canyon
  "grte", // Grand Teton
  "grba", // Great Basin
  "grsa", // Great Sand Dunes
  "grsm", // Great Smoky Mountains
  "hale", // Haleakalā
  "havo", // Hawaiʻi Volcanoes
  "hosp", // Hot Springs
  "indu", // Indiana Dunes
  "isro", // Isle Royale
  "jotr", // Joshua Tree
  "katm", // Katmai
  "kefj", // Kenai Fjords
  "kica", // Kings Canyon
  "kova", // Kobuk Valley
  "lacl", // Lake Clark
  "lavo", // Lassen Volcanic
  "maca", // Mammoth Cave
  "meve", // Mesa Verde
  "mora", // Mount Rainier
  "noca", // North Cascades
  "olym", // Olympic
  "pefo", // Petrified Forest
  "pinn", // Pinnacles
  "redw", // Redwood
  "romo", // Rocky Mountain
  "sagu", // Saguaro
  "seki", // Sequoia
  "shen", // Shenandoah
  "thro", // Theodore Roosevelt
  "viis", // Virgin Islands
  "voya", // Voyageurs
  "whsa", // White Sands
  "wica", // Wind Cave
  "wrst", // Wrangell–St. Elias
  "yell", // Yellowstone
  "yose", // Yosemite
  "zion", // Zion
  "npsa", // National Park of American Samoa
  "neri", // New River Gorge
  "jeff", // Gateway Arch
  "deva"  // Death Valley
      ];

      const allEvents = [];
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      await Promise.allSettled(
        parkCodes.map(async (code) => {
          try {
            const FUNCTION_BASE_URL = "https://getparkevents-wqrkpofo6a-uc.a.run.app";
            const res = await fetch(`${FUNCTION_BASE_URL}/?parkCode=${code}`);
            const data = await res.json();

            data.data.forEach((event) => {
              if (event.datestart) {
                const startDate = new Date(event.datestart);
                if (startDate >= todayDate) {
                  allEvents.push({
                    id: event.id,
                    title: event.title,
                    park: event.parkfullname || code.toUpperCase(),
                    start: startDate,
                    end: event.dateend ? new Date(event.dateend) : startDate,
                    description: event.description,
                  });
                }
              }
            });
          } catch (err) {
            console.error(`❌ Failed to fetch for park: ${code}`, err);
          }
        })
      );

      const sorted = allEvents.sort((a, b) => a.start - b.start);
      setEvents(sorted);
      setLoading(false);
    };

    fetchAllEvents();
  }, []);

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

    const selectedISODate = selectedDate.toISOString().split("T")[0];

    const filteredEvents = events.filter((e) => {
      if (!e.start || isNaN(e.start)) return false;
      const eventISODate = e.start.toISOString().split("T")[0];
      const matchesDate = eventISODate === selectedISODate;
      const matchesPark = selectedPark === "All" || e.park === selectedPark;
      return matchesDate && matchesPark;
    });

    // Debug Logs
    console.log("🧭 Selected Date:", selectedISODate);
    console.log("📆 All Event Dates:", events.map((e) => e.start?.toISOString().split("T")[0]));
    console.log("🎯 Filtered Events:", filteredEvents);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans">
      <button
        onClick={() => navigate("/")}
        className="mb-4 text-blue-600 hover:underline text-sm"
      >
        ← Back to Parks
      </button>

      <h1 className="text-3xl font-bold mb-6"> National Park Events by Date</h1>

      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div>
          <label className="text-sm font-semibold mr-2">🔎 Filter by Park:</label>
          <select
            value={selectedPark}
            onChange={(e) => setSelectedPark(e.target.value)}
            className="border px-2 py-1 rounded text-sm"
          >
            <option>All</option>
            {[...new Set(events.map((e) => e.park))]
              .sort()
              .map((park) => (
                <option key={park}>{park}</option>
              ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold mr-2">🗓️ Pick a Date:</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            className="border px-2 py-1 rounded text-sm"
            minDate={new Date()}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading events...</p>
      ) : filteredEvents.length === 0 ? (
        <p className="text-red-500">No events found for this date.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded shadow p-4 border border-blue-100 hover:border-blue-300"
            >
              <h3 className="text-lg font-semibold text-blue-700 mb-1">
                {event.title}
              </h3>
              <p className="text-sm text-gray-600">📍 {event.park}</p>
              <p className="text-sm text-gray-600">🗓️ {event.start.toDateString()}</p>
              <p className="text-sm text-gray-600 mb-2">🕒 {event.start.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              </p>
              <div
                className="text-gray-700 text-sm"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(event.description || "No description available."),
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarView;