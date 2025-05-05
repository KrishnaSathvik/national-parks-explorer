// Home.jsx (updated with FadeInWrapper)
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import FadeInWrapper from "../components/FadeInWrapper";
import { useNavigate, useSearchParams, Link } from "react-router-dom";


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const Home = ({ parks, favorites, toggleFavorite }) => {
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("All");
  const [selectedSeason, setSelectedSeason] = useState("All");
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"));
  const navigate = useNavigate();

  const parksPerPage = 9;

  useEffect(() => {
    setSearchParams({ page: currentPage });
  }, [currentPage]);

  const allStates = parks.flatMap((p) => p.state.split(",").map((s) => s.trim()));
  const uniqueStates = ["All", ...Array.from(new Set(allStates))];
  const seasons = ["All", "Spring", "Summer", "Fall", "Winter"];

  const filtered = parks.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchesState = selectedState === "All" || p.state?.toLowerCase().includes(selectedState.toLowerCase());
    const matchesSeason = selectedSeason === "All" || p.bestSeason?.toLowerCase() === selectedSeason.toLowerCase();
    return matchesSearch && matchesState && matchesSeason;
  });

  const indexLast = currentPage * parksPerPage;
  const indexFirst = indexLast - parksPerPage;
  const currentParks = filtered.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(filtered.length / parksPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-sans fade-in">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-heading font-bold">🌍 Explore National Parks</h1>
        <div className="flex gap-2">
    <Link
      to="/calendar"
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
    >
      📅 View Park Events
    </Link>
        <button
          onClick={() => navigate("/favorites")}
          className="text-xl font-heading font-semibold text-black hover:underline transition"
        >
          ❤️ View Favorites
        </button>
      </div>
      </div>

      <MapContainer
        center={[39.5, -98.35]}
        zoom={4}
        scrollWheelZoom={false}
        className="h-80 w-full rounded mb-6 shadow"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {parks.map((park) => {
          const [lat, lng] = park.coordinates?.split(",").map((val) => parseFloat(val.trim()));
          return (
            <Marker key={park.id} position={[lat, lng]}>
              <Popup>
                <strong>{park.name}</strong>
                <br />
                <button
                  onClick={() => navigate(`/park/${park.id}?page=${currentPage}`)}
                  className="text-blue-600 underline mt-1"
                >
                  View Park →
                </button>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-3 py-2 rounded shadow-sm text-lg font-heading font-semibold focus:outline-none focus:ring focus:ring-blue-200"
          placeholder="Search parks..."
        />
        <select
          value={selectedState}
          onChange={(e) => {
            setSelectedState(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-3 py-2 rounded shadow-sm text-lg font-heading font-semibold focus:outline-none focus:ring focus:ring-blue-200"
        >
          {uniqueStates.map((state) => (
            <option key={state}>{state}</option>
          ))}
        </select>
        <select
          value={selectedSeason}
          onChange={(e) => {
            setSelectedSeason(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-3 py-2 rounded shadow-sm text-lg font-heading font-semibold focus:outline-none focus:ring focus:ring-blue-200"
        >
          {seasons.map((season) => (
            <option key={season}>{season}</option>
          ))}
        </select>
      </div>

      <ul className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentParks.map((park, idx) => (
          <FadeInWrapper key={park.id} delay={idx * 0.1}>
            <li
              className="border p-4 rounded shadow hover:shadow-md transition-transform duration-300 hover:scale-105 cursor-pointer relative bg-white"
              onClick={() => navigate(`/park/${park.id}?page=${currentPage}`)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(park.id);
                }}
                className="absolute top-2 right-2 text-xl"
              >
                {favorites.includes(park.id) ? (
                  <span className="text-red-500">❤️</span>
                ) : (
                  <span className="text-gray-400 hover:text-red-500">🤍</span>
                )}
              </button>
              <h2 className="text-xl font-heading font-semibold">{park.name}</h2>
              <p className="text-gray-600">{park.state}</p>
              <p className="text-sm text-gray-500 mt-1">
                📆 Best Season: {park.bestSeason}
              </p>
            </li>
          </FadeInWrapper>
        ))}
      </ul>

      <div className="flex justify-center mt-8 space-x-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded-full border ${
              currentPage === i + 1
                ? "bg-blue-500 text-white"
                : "bg-white text-blue-500 border-blue-500"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Home;