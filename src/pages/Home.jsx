import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import FadeInWrapper from "../components/FadeInWrapper";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import SkeletonLoader from "../components/SkeletonLoader";

// Fix for default Leaflet marker icon
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
  const { currentUser, userRole, logout } = useAuth();

  const parksPerPage = 9;

  // Update URL page param
  useEffect(() => {
    setSearchParams({ page: currentPage });
  }, [currentPage]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Unique dropdown options
  const allStates = parks.flatMap((p) => p.state.split(",").map((s) => s.trim()));
  const uniqueStates = ["All", ...Array.from(new Set(allStates))];
  const seasons = ["All", "Spring", "Summer", "Fall", "Winter"];

  // Filtering logic
  const filtered = parks.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchesState = selectedState === "All" || p.state?.toLowerCase().includes(selectedState.toLowerCase());
    const matchesSeason = selectedSeason === "All" || p.bestSeason?.toLowerCase() === selectedSeason.toLowerCase();
    return matchesSearch && matchesState && matchesSeason;
  });

  // Pagination logic
  const indexLast = currentPage * parksPerPage;
  const indexFirst = indexLast - parksPerPage;
  const currentParks = filtered.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(filtered.length / parksPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-sans">
      {/* 🔗 Header and Auth Buttons */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 sm:gap-6 mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-pink-600 flex items-center gap-2 text-center sm:text-left">
          🌍 Explore National Parks
        </h1>

        <div className="flex flex-wrap justify-center sm:justify-end gap-3">
          <Link to="/calendar" className="btn-outline">📅 Park Events</Link>
          <Link to="/blog" className="btn-outline">📰 Blog Stories</Link>
          <Link to="/about" className="btn-outline">📖 About</Link>

          {currentUser ? (
            <>
              {userRole === "admin" ? (
                <a href="/admin" target="_blank" rel="noopener noreferrer" className="btn-filled">⚙️ Admin Panel</a>
              ) : (
                <Link to="/account" className="btn-outline">👤 My Account</Link>
              )}
              <button
                onClick={async () => {
                  await logout();
                  showToast("👋 Logged out successfully", "success");
                  navigate("/");
                }}
                className="btn-gray"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-filled">🔐 Login</Link>
          )}
        </div>
      </div>

      {/* 🗺️ Map Container */}
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

      {/* 🔍 Search & State Filters */}
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

      {/* 🍂 Season Filters */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
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

      {/* 🏞️ Park Cards or Skeleton */}
      {parks.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-48 w-full shadow-sm" />
          ))}
        </div>
      ) : (
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
                    title={
                      favorites.includes(park.id)
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    {favorites.includes(park.id) ? "❤️" : "🤍"}
                  </button>
                )}
                <h2 className="text-lg font-semibold text-pink-600 mb-1">{park.name}</h2>
                <p className="text-sm text-gray-600">📍 {park.state}</p>
                <p className="text-sm text-gray-600">
                  📆 Best Season:{" "}
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    park.bestSeason === "Spring"
                      ? "bg-green-100 text-green-800"
                      : park.bestSeason === "Summer"
                      ? "bg-yellow-100 text-yellow-800"
                      : park.bestSeason === "Fall"
                      ? "bg-orange-100 text-orange-800"
                      : park.bestSeason === "Winter"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {park.bestSeason}
                  </span>
                </p>
              </div>
            </FadeInWrapper>
          ))}
        </div>
      )}

      {/* 📄 Pagination */}
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
