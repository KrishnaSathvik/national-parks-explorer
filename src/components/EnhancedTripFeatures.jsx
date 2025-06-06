// EnhancedTripFeatures.jsx (refactored utility panel)
import React from 'react';
import { FaShareAlt, FaStickyNote, FaPrint, FaCopy } from 'react-icons/fa';

const EnhancedTripFeatures = ({ trip, onShare, onCopy, onPrint, onNote }) => {
  if (!trip) return null;

  return (
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
              onClick={onShare}
              className="bg-white border border-gray-200 p-3 rounded-xl flex items-center gap-2 hover:border-pink-500 hover:bg-pink-50"
          >
            <FaShareAlt className="text-pink-500" /> Share Trip
          </button>

          <button
              onClick={onCopy}
              className="bg-white border border-gray-200 p-3 rounded-xl flex items-center gap-2 hover:border-yellow-500 hover:bg-yellow-50"
          >
            <FaCopy className="text-yellow-500" /> Copy Plan
          </button>

          <button
              onClick={onPrint}
              className="bg-white border border-gray-200 p-3 rounded-xl flex items-center gap-2 hover:border-blue-500 hover:bg-blue-50"
          >
            <FaPrint className="text-blue-500" /> Print PDF
          </button>

          <button
              onClick={onNote}
              className="bg-white border border-gray-200 p-3 rounded-xl flex items-center gap-2 hover:border-purple-500 hover:bg-purple-50"
          >
            <FaStickyNote className="text-purple-500" /> Add Notes
          </button>
        </div>
      </div>
  );
};

export default EnhancedTripFeatures;