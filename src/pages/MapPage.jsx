import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import useIsMobile from "../hooks/useIsMobile";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ✅ Fix Leaflet icon path issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const MapPage = () => {
  const [parks, setParks] = useState([]);
  const mapRef = useRef();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    console.log("📍 MapPage mounted");
    const fetchParks = async () => {
      try {
        const snapshot = await getDocs(collection(db, "parks"));
        const parksList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setParks(parksList);
        console.log("📦 Parks fetched from Firestore:", parksList);
      } catch (error) {
        console.error("❌ Failed to fetch parks:", error);
      }
    };
    fetchParks();
  }, []);

  return (
    <div className="w-full h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] px-2 py-2 bg-white">
      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={4}
        scrollWheelZoom={true}
        whenCreated={(map) => {
          mapRef.current = map;
          setTimeout(() => map.invalidateSize(), 300);
        }}
        className="w-full h-full rounded-2xl shadow"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {parks
          .filter((park) => {
            const coords = park.coordinates?.split(",").map((c) => parseFloat(c.trim()));
            return coords?.length === 2 && coords.every((n) => !isNaN(n) && n !== 0);
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
    </div>
  );
};

export default MapPage;
