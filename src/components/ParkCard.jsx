import React from 'react';

const ParkCard = ({ park, onCardClick, toggleFavorite, isFavorite }) => {
  return (
    <div
      className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition relative cursor-pointer"
      onClick={() => onCardClick(park)}
    >
      {/* Favorite Heart */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent modal opening when clicking heart
          toggleFavorite(park.id);
        }}
        className="absolute top-3 right-3 text-2xl"
      >
        {isFavorite ? '❤️' : '🤍'}
      </button>

      {/* Card Content */}
      <h2 className="text-xl font-bold mb-2">{park.name}</h2>
      <p className="text-gray-600 mb-1"><strong>State:</strong> {park.state}</p>
      <p className="text-gray-600 mb-1"><strong>Coordinates:</strong> {park.coordinates}</p>
      <p className="text-gray-600 mb-3"><strong>Best Season:</strong> {park.bestSeason}</p>
      <p className="text-green-600 font-semibold hover:underline">Click to See Details</p>
    </div>
  );
};

export default ParkCard;
