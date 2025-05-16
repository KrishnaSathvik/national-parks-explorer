// src/components/ScrollToTopButton.jsx
import React, { useEffect, useState } from "react";

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 300); // ✅ Simple and reliable
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 bg-pink-500 text-white p-3 rounded-full shadow-xl hover:bg-pink-600 transition"
      title="Back to Top"
    >
      ⬆️
    </button>
  );
};

export default ScrollToTopButton;
