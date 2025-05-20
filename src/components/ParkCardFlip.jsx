import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const getEmojiByRegion = (state) => {
  if (!state) return "🌲";
  const s = state.toLowerCase();
  if (s.includes("california") || s.includes("west")) return "🌄";
  if (s.includes("arizona") || s.includes("desert")) return "🏜️";
  if (s.includes("mount")) return "🗻";
  if (s.includes("florida")) return "🌴";
  if (s.includes("alaska")) return "❄️";
  return "🌲"; // Default
};

const ParkCardFlip = ({
  id,
  name,
  state,
  bestSeason,
  entryFee = "$35",
  hours = "24/7",
  highlight
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentPage = searchParams.get("page") || 1;
  const [flipped, setFlipped] = useState(false);
  const emoji = getEmojiByRegion(state);
  const finalHighlight = highlight || "Explore breathtaking scenery";

  return (
    <div
      className="flip-card w-full h-64"
      onClick={() => setFlipped(!flipped)} // Enable tap flip
      onTouchStart={() => setFlipped(!flipped)}
    >
      <div className={`flip-card-inner w-full h-full rounded-2xl ${flipped ? "rotate-y-180" : ""}`}> 
        {/* Front */}
        <div className="flip-card-front bg-white shadow-md p-5 relative flex flex-col justify-between rounded-2xl">
          <div className="absolute top-3 left-3 text-xl">{emoji}</div>
          <div className="text-center">
            <h2 className="text-lg font-bold text-pink-600">{name}</h2>
            <p className="text-sm text-gray-600 mt-1">📍 {state}</p>
            <p className="mt-2 text-sm">
              📆 Best Season: {" "}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  bestSeason === "Spring"
                    ? "bg-green-100 text-green-800"
                    : bestSeason === "Summer"
                    ? "bg-yellow-100 text-yellow-800"
                    : bestSeason === "Fall"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {bestSeason}
              </span>
            </p>
          </div>
          <div className="text-center text-sm text-gray-500 mt-4">Tap to flip →</div>
        </div>

        {/* Back */}
        <div className="flip-card-back shadow-md p-5 flex flex-col justify-between text-center rounded-2xl bg-pink-50">
          <div>
            <h3 className="text-md font-semibold text-pink-600 mb-2">Quick Facts</h3>
            <p className="text-sm text-gray-700">💵 Entry Fee: {entryFee}</p>
            <p className="text-sm text-gray-700">🕒 Hours: {hours}</p>
            <p className="text-sm text-gray-700">🌄 Highlight: {finalHighlight}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation(); // prevent flip on tap
              navigate(`/park/${id}?page=${currentPage}`);
            }}
            className="mt-4 inline-block bg-pink-600 text-white text-sm px-4 py-2 rounded-full hover:bg-pink-700 transition"
          >
            View Park →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParkCardFlip;