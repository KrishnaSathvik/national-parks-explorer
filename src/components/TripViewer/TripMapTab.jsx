// TripMapTab.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Default marker fix
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
});

const TripMapTab = ({ trip }) => {
    const validParks = trip.parks?.filter(p => p.coordinates && p.coordinates.lat && p.coordinates.lng);

    const center = validParks?.length > 0
        ? [validParks[0].coordinates.lat, validParks[0].coordinates.lng]
        : [39.8283, -98.5795]; // default center: center of USA

    const routePath = validParks?.map(p => [p.coordinates.lat, p.coordinates.lng]);

    return (
        <div className="h-[60vh] rounded-xl overflow-hidden shadow-md">
            <MapContainer center={center} zoom={5} scrollWheelZoom={false} className="w-full h-full z-0">
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {validParks?.map((park, index) => (
                    <Marker
                        key={park.parkId || index}
                        position={[park.coordinates.lat, park.coordinates.lng]}
                    >
                        <Popup>
                            <strong>{park.parkName}</strong><br />
                            {park.state} — {park.stayDuration} day{park.stayDuration > 1 ? 's' : ''}
                        </Popup>
                    </Marker>
                ))}

                {routePath && routePath.length > 1 && (
                    <Polyline positions={routePath} color="blue" weight={3} opacity={0.7} />
                )}
            </MapContainer>
        </div>
    );
};

export default TripMapTab;
