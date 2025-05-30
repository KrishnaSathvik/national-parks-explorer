import React, { useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons (matching your Home.jsx pattern)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const TripMap = ({ parks }) => {
  const mapRef = useRef(null);

  // Create route path for polyline
  const routePath = parks
    .filter(park => park.coordinates.lat !== 0 && park.coordinates.lng !== 0)
    .map(park => [park.coordinates.lat, park.coordinates.lng]);

  // Calculate center and zoom based on parks
  const getMapCenter = () => {
    if (parks.length === 0) return [39.5, -98.35]; // Default US center
    
    const validParks = parks.filter(p => p.coordinates.lat !== 0 && p.coordinates.lng !== 0);
    if (validParks.length === 0) return [39.5, -98.35];
    
    const lats = validParks.map(p => p.coordinates.lat);
    const lngs = validParks.map(p => p.coordinates.lng);
    
    return [
      (Math.max(...lats) + Math.min(...lats)) / 2,
      (Math.max(...lngs) + Math.min(...lngs)) / 2
    ];
  };

  const getMapZoom = () => {
    if (parks.length <= 1) return 5;
    if (parks.length <= 3) return 4;
    return 3;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
        <h3 className="font-semibold text-pink-800 flex items-center gap-2">
          <span className="text-lg">🗺️</span> Trip Route
        </h3>
        <p className="text-sm text-pink-600 mt-1">
          {parks.length === 0 
            ? 'Add parks to see your route on the map' 
            : `${parks.length} park${parks.length !== 1 ? 's' : ''} selected`
          }
        </p>
      </div>
      
      <div className="h-96">
        {parks.length === 0 ? (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <span className="text-4xl block mb-2">🏞️</span>
              <p className="font-medium">Your route will appear here</p>
              <p className="text-sm">Add parks to start planning your adventure!</p>
            </div>
          </div>
        ) : (
          <MapContainer 
            center={getMapCenter()} 
            zoom={getMapZoom()} 
            scrollWheelZoom={true} 
            className="w-full h-full"
            ref={mapRef}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {/* Park markers */}
            {parks
              .filter(park => park.coordinates.lat !== 0 && park.coordinates.lng !== 0)
              .map((park, index) => (
              <Marker 
                key={park.parkId} 
                position={[park.coordinates.lat, park.coordinates.lng]}
              >
                <Popup>
                  <div className="text-center">
                    <strong className="text-pink-600">
                      {index + 1}. {park.parkName}
                    </strong>
                    {park.visitDate && (
                      <div className="text-sm text-gray-600 mt-1">
                        📅 Visit: {new Date(park.visitDate).toLocaleDateString()}
                      </div>
                    )}
                    {park.stayDuration && (
                      <div className="text-sm text-gray-600">
                        🏕️ Stay: {park.stayDuration} day{park.stayDuration !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Route line */}
            {parks.length > 1 && routePath.length > 1 && (
              <Polyline 
                positions={routePath}
                pathOptions={{
                  color: '#ec4899', // Pink color to match your theme
                  weight: 3,
                  opacity: 0.7,
                  dashArray: '10, 10'
                }}
              />
            )}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default TripMap;