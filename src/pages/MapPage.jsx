// src/pages/MapPage.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapPage = () => {
  const [parks, setParks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParks = async () => {
      const snapshot = await getDocs(collection(db, "parks"));
      const parksList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setParks(parksList);
    };
    fetchParks();
  }, []);

  return (
    <div className="h-screen w-full">
      <MapContainer center={[39.8283, -98.5795]} zoom={4} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {parks
          .filter(park => {
            const [lat, lon] = park.coordinates?.split(",").map(c => parseFloat(c.trim()));
            return lat && lon && lat !== 0 && lon !== 0 && !isNaN(lat) && !isNaN(lon);
          })
          .map((park) => {
            const [lat, lon] = park.coordinates.split(",").map(coord => parseFloat(coord.trim()));
            return (
              <Marker
                key={park.id}
                position={[lat, lon]}
                eventHandlers={{
                  click: () => navigate(`/park/${park.id}`)
                }}
              >
                <Popup>
                  <strong>{park.name}</strong><br />
                  {park.state}
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
};

export default MapPage;
