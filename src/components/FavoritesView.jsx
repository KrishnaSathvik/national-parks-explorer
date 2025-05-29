// src/components/FavoritesView.jsx
import React from "react";
import FadeInWrapper from "./FadeInWrapper";
import DOMPurify from "dompurify";
import { useNavigate } from "react-router-dom";

const FavoritesView = ({
  parks = [],
  events = [],
  onRemovePark,
  onRemoveEvent,
  parksLoading = false,
  eventsLoading = false,
}) => {
  const navigate = useNavigate();

  const parsedEvents = events.map((event) => ({
    ...event,
    start: event?.start ? new Date(event.start) : null,
    end: event?.end ? new Date(event.end) : null,
  }));

  return (
    <div className="space-y-12">
      <Section title="💖 Favorite Parks" loading={parksLoading} empty={parks.length === 0}>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parks.map((park, idx) => (
            <FadeInWrapper key={park.id} delay={idx * 0.1}>
              <div
                onClick={() => navigate(`/park/${park.id}?page=1`, { state: { from: "favorites" } })}
                className="p-5 bg-white rounded-xl shadow hover:shadow-md border hover:scale-[1.01] transition cursor-pointer relative"
              >
                {onRemovePark && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemovePark(park.id);
                    }}
                    className="absolute top-3 right-3 text-xl text-pink-500 hover:scale-110 transition"
                    title="Remove from favorites"
                  >
                    ❤️
                  </button>
                )}
                <h2 className="text-lg font-semibold text-pink-600">{park.name}</h2>
                <p className="text-sm text-gray-500">📍 {park.state}</p>
                <p className="text-sm mt-1">
                  📆 Best Season:{" "}
                  {park.bestSeason && (
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      park.bestSeason === "Summer"
                        ? "bg-yellow-100 text-yellow-800"
                        : park.bestSeason === "Winter"
                        ? "bg-blue-100 text-blue-800"
                        : park.bestSeason === "Spring"
                        ? "bg-green-100 text-green-800"
                        : park.bestSeason === "Fall"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {park.bestSeason}
                    </span>
                  )}
                </p>
              </div>
            </FadeInWrapper>
          ))}
        </div>
      </Section>

      <Section title="📅 Favorite Events" loading={eventsLoading} empty={parsedEvents.length === 0}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {parsedEvents.map((event, idx) => (
            <FadeInWrapper key={event.id} delay={idx * 0.05}>
              <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition relative">
                {onRemoveEvent && (
                  <button
                    onClick={() => onRemoveEvent(event.id)}
                    className="absolute top-3 right-3 text-sm text-red-500 hover:underline"
                  >
                    ❌ Remove
                  </button>
                )}
                <h3 className="text-lg font-semibold text-pink-600">{event.title}</h3>
                <p className="text-sm text-gray-600">📍 {event.park || "Unknown Park"}</p>
                <p className="text-sm text-gray-600">
                  🗓️ {event.start ? event.start.toDateString() : "Unknown Date"}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  🕒 {event.start ? event.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Unknown Time"}
                </p>
                {event.url && (
                  <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm underline block mb-2">
                    🔗 Official Event Link
                  </a>
                )}
                <div
                  className="text-sm text-gray-700"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description || "No description available.") }}
                />
              </div>
            </FadeInWrapper>
          ))}
        </div>
      </Section>
    </div>
  );
};

const Section = ({ title, loading, empty, children }) => (
  <div>
    <h2 className="text-xl sm:text-2xl font-heading font-semibold mb-4 text-gray-700">{title}</h2>
    {loading ? <p className="text-gray-400 italic">Loading...</p> : empty ? <p className="text-gray-500">Nothing here yet.</p> : children}
  </div>
);

export default FavoritesView;
