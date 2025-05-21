import React, { useState } from 'react';
import './ParkCardFlip.css'; // Create this file like TestFlip.css
import { useNavigate, useSearchParams } from 'react-router-dom';

const getEmojiByRegion = (state) => {
  if (!state) return '🌲';
  const s = state.toLowerCase();
  if (s.includes('california')) return '🌉';
  if (s.includes('arizona') || s.includes('utah')) return '🏜️';
  if (s.includes('montana') || s.includes('colorado') || s.includes('wyoming')) return '⛰️';
  if (s.includes('florida') || s.includes('hawaii')) return '🌴';
  if (s.includes('alaska')) return '❄️';
  if (s.includes('texas') || s.includes('new mexico')) return '🤠';
  return '🌲';
};

const ParkCardFlip = ({ id, name, slug, state, bestSeason, entryFee = '$35', hours = '24/7', highlight }) => {
  const [flipped, setFlipped] = useState(false);
  const [searchParams] = useSearchParams();
  const currentPage = searchParams.get('page') || 1;
  const navigate = useNavigate();
  const emoji = getEmojiByRegion(state);

  return (
    <div className="park-card-wrapper" onClick={() => setFlipped(!flipped)}>
      <div className={`park-flip-inner ${flipped ? 'flipped' : ''}`}>
        <div className="park-flip-front">
          <div className="text-2xl mb-2">{emoji}</div>
          <h2 className="text-lg font-bold text-pink-600">{name}</h2>
          <p className="text-sm text-gray-600">📍 {state}</p>
          <p className="mt-2 text-sm">
            📆 Best Season:{' '}
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-800">
              {bestSeason}
            </span>
          </p>
          <p className="text-sm text-gray-400 mt-3">Tap to flip →</p>
        </div>

        <div className="park-flip-back">
          <h3 className="text-md font-semibold text-pink-600 mb-2">Quick Facts</h3>
          <p className="text-sm text-gray-700">💵 Entry Fee: {entryFee}</p>
          <p className="text-sm text-gray-700">🕒 Hours: {hours}</p>
          <p className="text-sm text-gray-700">🌄 Highlight: {highlight}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/park/${slug}?page=${currentPage}`);
            }}
            className="mt-4 bg-pink-600 text-white px-4 py-2 rounded-full hover:bg-pink-700 text-sm"
          >
            View Park →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParkCardFlip;
