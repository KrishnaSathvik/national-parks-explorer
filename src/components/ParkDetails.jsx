import React, { useEffect, useState } from 'react';

const ParkDetails = ({ park, onClose }) => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=***REMOVED***&q=${encodeURIComponent(park.name.split(' ')[0])}`
        );
        const data = await response.json();
        if (data.current) {
          setWeather({
            temp: data.current.temp_f,
            condition: data.current.condition.text,
            icon: data.current.condition.icon
          });
        } else {
          setWeather(null);
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
        setWeather(null);
      }
    };

    fetchWeather();
  }, [park.name]);

  if (!park) return null;

  const scrollToTop = () => {
    const modalContent = document.getElementById('modalContent');
    if (modalContent) {
      modalContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
      <div
        id="modalContent"
        className="bg-white rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2 p-6 overflow-y-auto max-h-[90vh] relative"
      >

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl"
        >
          &times;
        </button>

        {/* Park Basic Info */}
        <h2 className="text-3xl font-bold mb-2">{park.name}</h2>
        <p className="text-gray-600 mb-1"><strong>State:</strong> {park.state}</p>
        <p className="text-gray-600 mb-1"><strong>Coordinates:</strong> {park.coordinates}</p>
        <p className="text-gray-600 mb-3"><strong>Best Season:</strong> {park.bestSeason}</p>

        {/* Google Map Link */}
        <div className="mb-6">
          <a
            href={park.mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
          >
            View {park.name} on Google Maps
          </a>
        </div>

        {/* Weather Info */}
        {weather && (
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-2">Current Weather:</h3>
            <div className="flex items-center gap-3">
              {weather.icon && (
                <img src={`https:${weather.icon}`} alt="Weather Icon" className="w-10 h-10" />
              )}
              <div>
                <p className="text-gray-700 text-lg">🌡️ {weather.temp}°F</p>
                <p className="text-gray-700 text-lg">☁️ {weather.condition}</p>
              </div>
            </div>
          </div>
        )}

        {/* Divider */}
        <hr className="my-6 border-t-2 border-gray-200" />

        {/* Best Places */}
        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-4">Best Places to Visit:</h3>
          <ul className="list-disc pl-5 space-y-2">
            {park.placesToVisit.map((place, index) => (
              <li key={index}>
                <a
                  href={place.locationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 hover:underline font-medium"
                >
                  {place.name}
                </a> — {place.description}
              </li>
            ))}
          </ul>
        </div>

        {/* Divider */}
        <hr className="my-6 border-t-2 border-gray-200" />

        {/* Foods Nearby */}
        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-4">Foods Nearby:</h3>
          <ul className="list-disc pl-5 space-y-2">
            {park.foodsNearby.map((food, index) => (
              <li key={index}>
                <a
                  href={food.locationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 hover:underline font-medium"
                >
                  {food.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Divider */}
        <hr className="my-6 border-t-2 border-gray-200" />

        {/* Hotels/Campgrounds Nearby */}
        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-4">Hotels/Campgrounds Nearby:</h3>
          <ul className="list-disc pl-5 space-y-2">
            {park.hotelsNearby.map((hotel, index) => (
              <li key={index}>
                <a
                  href={hotel.locationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 hover:underline font-medium"
                >
                  {hotel.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Back to Top Button */}
        <div className="flex justify-center">
          <button
            onClick={scrollToTop}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            ⬆️ Back to Top
          </button>
        </div>

      </div>
    </div>
  );
};

export default ParkDetails;
