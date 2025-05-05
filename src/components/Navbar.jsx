import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-green-700 text-white shadow px-4 py-3 flex justify-between items-center">
      <div className="flex gap-6 items-center text-lg font-semibold">
        <Link to="/" className="hover:underline">🏛️ Parks</Link>
        <Link to="/map" className="hover:underline">🌏 Map</Link>
      </div>
      <Link
        to="/favorites"
        className="rounded-full px-4 py-2 text-white font-semibold bg-pink-600 hover:bg-pink-700 shadow-md transition"
      >
        💖 View Favorites
      </Link>
    </nav>
  );
};

export default Navbar;