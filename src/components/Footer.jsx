// src/components/Footer.jsx
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-pink-100 py-6 text-center text-xs sm:text-sm text-gray-500 font-sans shadow-inner">
      <div className="max-w-7xl mx-auto px-4">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold text-gray-700">National Parks Explorer</span>. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
