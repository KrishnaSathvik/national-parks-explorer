  import React, { useEffect, useState, useMemo } from "react";
  import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
  import "leaflet/dist/leaflet.css";
  import L from "leaflet";
  import FadeInWrapper from "../components/FadeInWrapper";
  import { useNavigate, useSearchParams, Link } from "react-router-dom";
  import { useAuth } from "../context/AuthContext";
  import { useToast } from "../context/ToastContext";
  import SkeletonLoader from "../components/SkeletonLoader";
  import {
    FaCalendarAlt,
    FaNewspaper,
    FaBookOpen,
    FaUser,
    FaLock,
    FaCogs,
  } from "react-icons/fa";

  // Fix Leaflet icons
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

    useEffect(() => {
      setSearchParams({ page: currentPage });
    }, [currentPage]);

    useEffect(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const handleLogout = async () => {
      await logout();
      showToast("👋 Logged out successfully", "success");
      navigate("/");
    };

    const allStates = useMemo(
      () => parks.flatMap((p) => p.state?.split(",").map((s) => s.trim()) || []),
      [parks]
    );
    const uniqueStates = useMemo(() => ["All", ...Array.from(new Set(allStates))], [allStates]);
    const seasons = ["All", "Spring", "Summer", "Fall", "Winter"];

    const filtered = parks.filter((p) => {
      const name = p.name?.toLowerCase() || "";
      const state = p.state?.toLowerCase() || "";
      const season = p.bestSeason?.toLowerCase() || "";

      return (
        name.includes(search.toLowerCase()) &&
        (selectedState === "All" || state.includes(selectedState.toLowerCase())) &&
        (selectedSeason === "All" || season === selectedSeason.toLowerCase())
      );
    });

    const indexLast = currentPage * parksPerPage;
    const indexFirst = indexLast - parksPerPage;
    const currentParks = filtered.slice(indexFirst, indexLast);
    const totalPages = Math.ceil(filtered.length / parksPerPage);

    return (
      <div className="max-w-7xl mx-auto px-4 py-6 font-sans">
        <div className="max-w-7xl mx-auto px-4 py-6 font-sans">
          {/* 🔗 Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 sm:gap-6 mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-pink-600 flex items-center gap-2 text-center sm:text-left">
              🌍 Explore National Parks
            </h1>
            <div className="flex flex-wrap justify-center sm:justify-end gap-2 sm:gap-3 text-sm font-medium">
              <Link
                to="/calendar"
                role="button"
                tabIndex={0}
                onTouchStart={() => {}}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-white text-gray-800 border hover:bg-pink-50 hover:text-pink-600 transition"
              >
                <FaCalendarAlt /> Park Events
              </Link>
              <Link
                to="/blog"
                role="button"
                tabIndex={0}
                onTouchStart={() => {}}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-white text-gray-800 border hover:bg-pink-50 hover:text-pink-600 transition"
              >
                <FaNewspaper /> Blog Stories
              </Link>
              <Link
                to="/about"
                role="button"
                tabIndex={0}
                onTouchStart={() => {}}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-white text-gray-800 border hover:bg-pink-50 hover:text-pink-600 transition"
              >
                <FaBookOpen /> About
              </Link>

              {currentUser ? (
                <>
                  {userRole === "admin" ? (
                    <a
                      href="/admin"
                      target="_blank"
                      rel="noopener noreferrer"
                      role="button"
                      tabIndex={0}
                      onTouchStart={() => {}}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-pink-600 text-white hover:bg-pink-700 transition"
                    >
                      <FaCogs /> Admin Panel
                    </a>
                  ) : (
                    <Link
                      to="/account"
                      role="button"
                      tabIndex={0}
                      onTouchStart={() => {}}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-white text-gray-800 border hover:bg-pink-50 hover:text-pink-600 transition"
                    >
                      <FaUser /> My Account
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    type="button"
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-gray-100 text-gray-800 border hover:bg-red-50 hover:text-red-500 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  role="button"
                  tabIndex={0}
                  onTouchStart={() => {}}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-pink-600 text-white hover:bg-pink-700 transition"
                >
                  <FaLock /> Login
                </Link>
              )}
            </div>
          </div>

          {/* 🗺️ Map */}
          <div className="w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden shadow mb-6">
            <MapContainer center={[39.5, -98.35]} zoom={4} scrollWheelZoom={false} className="w-full h-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {parks.map((park) => {
                if (!park.coordinates?.includes(",")) return null;
                const [lat, lng] = park.coordinates.split(",").map((val) => parseFloat(val.trim()));
                if (isNaN(lat) || isNaN(lng)) return null;
                return (
                  <Marker key={park.id} position={[lat, lng]}>
                    <Popup>
                      <strong>{park.name}</strong><br />
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
          </div>

          {/* 🔍 Search & State Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-3 mb-6">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-1/2 border px-4 py-2 rounded-full text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="🔍 Search parks..."
            />
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-1/4 border px-4 py-2 rounded-full text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              {uniqueStates.map((state) => (
                <option key={state}>{state}</option>
              ))}
            </select>
          </div>

          {/* 🍂 Season Filter */}
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
            {seasons.map((season) => (
              <button
                key={season}
                onClick={() => {
                  setSelectedSeason(season);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
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
        {/* 🏞️ Park Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
          {parks.length === 0 ? (
            Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-48 w-full shadow-sm" />
            ))
          ) : (
            currentParks.map((park, idx) => (
              <FadeInWrapper key={park.id} delay={idx * 0.1}>
                <div
                  className="relative bg-white w-full max-w-[320px] mx-auto rounded-2xl px-4 py-6 shadow-md hover:shadow-lg transition cursor-pointer flex flex-col justify-between min-h-[160px]"
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
                  <div className="text-center">
                    <h2
                      className="text-base sm:text-lg font-semibold text-pink-600 leading-tight truncate"
                      title={park.name}
                    >
                      {park.name}
                    </h2>
                    <p className="text-sm text-gray-700 mb-1">📍 {park.state}</p>
                    <p className="text-sm text-gray-700">
                      📆 Best Season: {" "}
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                          park.bestSeason === "Spring"
                            ? "bg-green-100 text-green-800"
                            : park.bestSeason === "Summer"
                            ? "bg-yellow-100 text-yellow-800"
                            : park.bestSeason === "Fall"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {park.bestSeason}
                      </span>
                    </p>
                  </div>
                </div>
              </FadeInWrapper>
            ))
          )}
        </div>

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
      </div>
    );
  };

  export default Home;
