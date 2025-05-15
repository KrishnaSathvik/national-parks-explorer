import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import FadeInWrapper from "../components/FadeInWrapper";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";



// Leaflet icon fix
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
  const { showToast } = useToast();
  const { currentUser, logout } = useAuth();

  const parksPerPage = 9;

  useEffect(() => {
    setSearchParams({ page: currentPage });
  }, [currentPage]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

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
    <div className="max-w-7xl mx-auto px-4 py-6 font-sans">
      {/* Header and Auth Buttons */}
    <div className="mt-4 flex flex-col sm:flex-row sm:justify-center sm:items-center gap-3">
      <h1 className="text-3xl font-bold text-pink-600 whitespace-nowrap text-center sm:text-left">
        🌍 Explore National Parks
      </h1>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center sm:justify-end">
        <Link
          to="/calendar"
          className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-full text-sm text-center"
        >
          📅 View Park Events
        </Link>

        {currentUser ? (
          <>
            <button
              onClick={() => navigate("/favorites")}
              className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-full text-sm text-center"
            >
              ❤️ View Favorites
            </button>
            <button
              onClick={async () => {
                await logout();
                toast.success("👋 Logged out successfully");
                navigate("/");
              }}
              className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-full text-sm text-center"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-full text-sm text-center"
          >
            🔐 Login to save your favorites
          </Link>
        )}
      </div>
    </div>

      {/* Map */}
      <div className="w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden shadow mb-6">
        <MapContainer center={[39.5, -98.35]} zoom={4} scrollWheelZoom={false} className="w-full h-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {parks.map((park) => {
            if (!park.coordinates || !park.coordinates.includes(",")) return null;
            const [lat, lng] = park.coordinates.split(",").map((val) => parseFloat(val.trim()));
            if (isNaN(lat) || isNaN(lng)) return null;
            return (
              <Marker key={park.id} position={[lat, lng]}>
                <Popup>
                  <strong>{park.name}</strong><br />
                  <button onClick={() => navigate(`/park/${park.id}?page=${currentPage}`)} className="text-blue-600 underline mt-1">
                    View Park →
                  </button>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Search & State Dropdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-4 py-2 rounded-full text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
          placeholder="🔍 Search parks..."
        />
        <select
          value={selectedState}
          onChange={(e) => {
            setSelectedState(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-4 py-2 rounded-full text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        >
          {uniqueStates.map((state) => <option key={state}>{state}</option>)}
        </select>
      </div>

      {/* Season Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {seasons.map((season) => (
          <button
            key={season}
            onClick={() => {
              setSelectedSeason(season);
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition ${
              selectedSeason === season
                ? "bg-pink-500 text-white border-pink-500"
                : "bg-white text-pink-500 border-pink-500 hover:bg-pink-50"
            }`}
          >
            {season === "Spring" && "🌸 "}
            {season === "Summer" && "🌞 "}
            {season === "Fall" && "🍂 "}
            {season === "Winter" && "❄️ "}
            {season}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {currentParks.map((park, idx) => (
          <FadeInWrapper key={park.id} delay={idx * 0.1}>
            <div
              className="bg-white rounded-xl border-l-4 border-pink-500 shadow-sm p-5 transition hover:shadow-md hover:scale-[1.01] cursor-pointer relative"
              onClick={() => navigate(`/park/${park.id}?page=${currentPage}`)}
            >
              {currentUser && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(park.id);
                  }}
                  className="absolute top-3 right-3 text-xl"
                  title={favorites.includes(park.id) ? "Remove from favorites" : "Add to favorites"}
                >
                  {favorites.includes(park.id) ? "❤️" : "🤍"}
                </button>
              )}

              <h2 className="text-lg font-semibold text-pink-600 mb-1">{park.name}</h2>
              <p className="text-sm text-gray-600">📍 {park.state}</p>
              <p className="text-sm text-gray-600">
                📆 Best Season:{" "}
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    park.bestSeason === "Spring"
                      ? "bg-green-100 text-green-800"
                      : park.bestSeason === "Summer"
                      ? "bg-yellow-100 text-yellow-800"
                      : park.bestSeason === "Fall"
                      ? "bg-orange-100 text-orange-800"
                      : park.bestSeason === "Winter"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {park.bestSeason}
                </span>
              </p>
            </div>
          </FadeInWrapper>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-8 space-x-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
              currentPage === i + 1
                ? "bg-pink-500 text-white border-pink-500"
                : "bg-white text-pink-500 border-pink-500 hover:bg-pink-50"
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
