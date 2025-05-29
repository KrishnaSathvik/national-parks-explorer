import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import useIsMobile from "../hooks/useIsMobile";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";

// 🛠️ Fix missing marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const MapPage = () => {
  const [parks, setParks] = useState([]);
  const [fullscreen, setFullscreen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchParks = async () => {
      try {
        const snapshot = await getDocs(collection(db, "parks"));
        const parksList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setParks(parksList);
      } catch (error) {
        console.error("Failed to fetch parks:", error);
      }
    };
    fetchParks();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative w-full ${
        isMobile
          ? fullscreen
            ? "fixed inset-0 z-50 h-screen"
            : "min-h-[90vh]"   // ✅ Give height on mobile when not fullscreen
          : "min-h-screen"
      }`}
    >
      {/* Header (hidden in fullscreen mobile) */}
      {!fullscreen && (
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-40 bg-white/90 backdrop-blur-md px-6 py-2 rounded-full shadow text-sm font-medium text-gray-800">
          🗺️ Explore National Parks Map
        </div>
      )}

      {/* Toggle button for mobile fullscreen */}
      {isMobile && (
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-40">
          {!fullscreen ? (
            <button
              onClick={() => setFullscreen(true)}
              className="bg-pink-600 text-white px-4 py-2 rounded-full shadow-md text-sm"
            >
              🗺️ Fullscreen Map
            </button>
          ) : (
            <button
              onClick={() => setFullscreen(false)}
              className="bg-gray-700 text-white px-4 py-2 rounded-full shadow-md text-sm"
            >
              ✖️ Exit Map
            </button>
          )}
        </div>
      )}

      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={4}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      />
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
                  click: () => navigate(`/park/${park.slug || park.id}`),
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
    </motion.div>
  );
};

export default MapPage;
