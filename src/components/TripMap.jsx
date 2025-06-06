// TripMap.jsx (Refactored for full trip visualization)
import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

const TripMap = ({ trips }) => {
  const allStops = trips.flatMap(trip =>
      (trip.parks || []).filter(p => p.coordinates && p.coordinates.lat && p.coordinates.lng)
  );

  const routePath = allStops.map(p => [p.coordinates.lat, p.coordinates.lng]);

  const center = routePath.length > 0
      ? routePath[Math.floor(routePath.length / 2)]
      : [39.8283, -98.5795]; // center of USA

  return (
      <div className="h-[75vh] rounded-xl overflow-hidden shadow">
        <MapContainer center={center} zoom={5} scrollWheelZoom={true} className="w-full h-full">
          <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
          />

          {allStops.map((p, index) => (
              <Marker key={`${p.parkId}-${index}`} position={[p.coordinates.lat, p.coordinates.lng]}>
                <Popup>
                  <strong>{p.parkName}</strong><br />
                  {p.state} — {p.stayDuration} day{p.stayDuration > 1 ? 's' : ''}
                </Popup>
              </Marker>
          ))}

          {routePath.length > 1 && (
              <Polyline positions={routePath} color="blue" weight={3} opacity={0.6} />
          )}
        </MapContainer>
      </div>
  );
};

export default TripMap;