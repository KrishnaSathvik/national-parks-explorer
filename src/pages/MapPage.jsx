import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const MapPage = () => {
  const [parks, setParks] = useState([]);
  const mapRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParks = async () => {
      const snap = await getDocs(collection(db, "parks"));
      const parksList = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setParks(parksList);
    };
    fetchParks();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white"
    >
      <div className="h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] px-2 py-2">
        <MapContainer
          center={[37.8, -96]}
          zoom={4}
          scrollWheelZoom={true}
          className="w-full h-full rounded-2xl shadow"
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {parks
            .filter((park) => {
              const coords = park.coordinates?.split(",").map((c) => parseFloat(c.trim()));
              return coords?.length === 2 && coords.every((n) => !isNaN(n) && n !== 0);
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
      </div>
    </motion.div>
  );
};

export default MapPage;
