import React, { useState } from 'react';
import './TestFlip.css'; // We'll define this next

const TestFlip = () => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="test-wrapper">
      <div
        className={`test-flip-card-inner ${flipped ? 'flipped' : ''}`}
        onClick={() => setFlipped(!flipped)}
      >
        {/* Front */}
        <div className="test-flip-card-front">
          <div className="text-2xl mb-2">🌲</div>
          <h2 className="font-bold text-lg text-pink-600">Test Park</h2>
          <p className="text-sm text-gray-600">📍 Test State</p>
          <p className="text-sm text-gray-400 mt-2">Tap to flip →</p>
        </div>

        {/* Back */}
        <div className="test-flip-card-back">
          <h3 className="text-md font-semibold text-pink-600 mb-2">Quick Facts</h3>
          <p className="text-sm text-gray-700">💵 Entry Fee: $20</p>
          <p className="text-sm text-gray-700">🕒 Hours: 24/7</p>
          <p className="text-sm text-gray-700">🌄 Highlight: Demo View</p>
        </div>
      </div>
    </div>
  );
};

export default TestFlip;
