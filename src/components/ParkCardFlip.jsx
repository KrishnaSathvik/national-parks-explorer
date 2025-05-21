import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const getEmojiByRegion = (state) => {
  if (!state) return "🌲";
  const s = state.toLowerCase();
  if (s.includes("california")) return "🌉";
  if (s.includes("arizona") || s.includes("utah")) return "🏜️";
  if (s.includes("montana") || s.includes("colorado") || s.includes("wyoming")) return "⛰️";
  if (s.includes("florida") || s.includes("hawaii")) return "🌴";
  if (s.includes("alaska")) return "❄️";
  if (s.includes("texas") || s.includes("new mexico")) return "🤠";
  return "🌲";
};

const ParkCardFlip = ({
  id,
  name,
  state,
  bestSeason,
  entryFee = "$35",
  hours = "24/7",
  highlight,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentPage = searchParams.get("page") || 1;
  const [flipped, setFlipped] = useState(false);
  const emoji = getEmojiByRegion(state);
  const finalHighlight = highlight || "Explore breathtaking scenery";

  return (
    <div
      className="flip-card h-64 w-full cursor-pointer"
      onClick={() => setFlipped(!flipped)}
      onTouchStart={() => setFlipped(!flipped)}
    >
      <div className={`flip-card-inner ${flipped ? "rotate-y-180" : ""}`}>
        <div className="flip-card-front p-4 shadow-md rounded-2xl flex flex-col justify-between text-center">
          <div className="text-2xl">{emoji}</div>
          <div>
            <h2 className="text-lg font-bold text-pink-600">{name}</h2>
            <p className="text-sm text-gray-600 mt-1">📍 {state}</p>
            <p className="mt-2 text-sm">
              📆 Best Season:{" "}
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
          <div className="text-sm text-gray-400 mt-2">Tap to flip →</div>
        </div>

        <div className="flip-card-back p-4 shadow-md rounded-2xl flex flex-col justify-between text-center">
          <div>
            <h3 className="text-md font-semibold text-pink-600 mb-2">Quick Facts</h3>
            <p className="text-sm text-gray-700">💵 Entry Fee: {entryFee}</p>
            <p className="text-sm text-gray-700">🕒 Hours: {hours}</p>
            <p className="text-sm text-gray-700">🌄 Highlight: {finalHighlight}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
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
