// ✅ Polished MapPage.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

// 🛠️ Fix Leaflet default icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const MapPage = () => {
  const [parks, setParks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParks = async () => {
      try {
        const snapshot = await getDocs(collection(db, "parks"));
        const parksList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setParks(parksList);
      } catch (err) {
        console.error("Failed to load parks for map:", err);
      }
    };

    fetchParks();
  }, []);

  return (
    <div className="relative h-screen w-full font-sans">
      {/* 🧭 Header Overlay */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-[999] bg-white/90 backdrop-blur-md rounded-full shadow px-6 py-2 text-sm font-medium text-gray-800">
        🗺️ Explore National Parks Map
      </div>

      {/* 🗺️ Leaflet Map */}
      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={4}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {parks
          .filter((park) => {
            const [lat, lng] = park.coordinates?.split(",").map((c) => parseFloat(c.trim()));
            return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
          })
          .map((park) => {
            const [lat, lng] = park.coordinates.split(",").map((c) => parseFloat(c.trim()));
            return (
              <Marker
                key={park.id}
                position={[lat, lng]}
                eventHandlers={{
                  click: () => navigate(`/park/${park.id}`),
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="text-base font-semibold text-pink-600">{park.name}</p>
                    <p className="text-gray-600">📍 {park.state}</p>
                    <p className="text-xs text-gray-400">Click to explore →</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
};

export default MapPage;
