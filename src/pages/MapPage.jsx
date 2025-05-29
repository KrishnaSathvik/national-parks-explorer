import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import useIsMobile from "../hooks/useIsMobile";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";

// ✅ Fix Leaflet marker icon path issues for mobile
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const MapPage = () => {
  const [parks, setParks] = useState([]);
  const [fullscreen, setFullscreen] = useState(false);
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // ✅ Initial mount
  useEffect(() => {
    console.log("📍 MapPage mounted");
  }, []);

  // ✅ Global error handler (temporary for debugging)
  useEffect(() => {
    window.onerror = (message, source, lineno, colno, error) => {
      console.error("🌐 Global JS error:", { message, source, lineno, colno, error });
    };
  }, []);

  // ✅ Detect mobile
  console.log("📱 Is Mobile View:", isMobile);

  // ✅ Fetch parks from Firestore
  useEffect(() => {
    const fetchParks = async () => {
      try {
        const snapshot = await getDocs(collection(db, "parks"));
        const parksList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("📦 Parks fetched from Firestore:", parksList);
        setParks(parksList);
      } catch (error) {
        console.error("❌ Failed to fetch parks:", error);
      }
    };
    fetchParks();
  }, []);

  useEffect(() => {
    console.log("🎯 Parks updated in state:", parks);
  }, [parks]);

  // ✅ Fix map size on fullscreen toggle
  useEffect(() => {
    if (fullscreen && mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 300);
    }
  }, [fullscreen]);

  return (
    <div className="w-full h-full min-h-screen bg-white">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative w-full h-full ${
          isMobile && fullscreen ? "fixed inset-0 z-50 bg-white" : "min-h-screen"
        }`}
      >
        {/* ✅ Top heading */}
        {!fullscreen && (
          <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-40 bg-white/90 backdrop-blur-md px-6 py-2 rounded-full shadow text-sm font-medium text-gray-800">
            🗺️ Explore National Parks Map
          </div>
        )}

        {/* ✅ Fullscreen toggle */}
        {isMobile && (
          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-40">
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className={`px-4 py-2 rounded-full shadow-md text-sm ${
                fullscreen ? "bg-gray-700 text-white" : "bg-pink-600 text-white"
              }`}
            >
              {fullscreen ? "✖️ Exit Map" : "🗺️ Fullscreen Map"}
            </button>
          </div>
        )}

        {/* ✅ Map container */}
        <MapContainer
          center={[39.8283, -98.5795]}
          zoom={4}
          scrollWheelZoom={true}
          whenCreated={(mapInstance) => {
            mapRef.current = mapInstance;
            console.log("🗺️ Leaflet Map instance created:", mapInstance);
          }}
          className={`w-full ${fullscreen ? "h-full" : "h-[90vh]"}`}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* ✅ Render valid park markers */}
          {parks
            .filter((park) => {
              const coords = park.coordinates?.split(",").map((c) => parseFloat(c.trim()));
              const isValid = coords?.length === 2 && coords.every((n) => !isNaN(n) && n !== 0);
              if (!isValid) {
                console.warn("❌ Invalid coordinates:", park.name, park.coordinates);
              }
              return isValid;
            })
            .map((park) => {
              const [lat, lng] = park.coordinates.split(",").map((c) => parseFloat(c.trim()));
              console.log("📍 Rendering marker for:", park.name, [lat, lng]);
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
    </div>
  );
};

export default MapPage;
