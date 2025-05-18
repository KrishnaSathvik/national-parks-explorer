// src/components/ScrollToTopButton.jsx
import React, { useEffect, useState } from "react";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return isVisible ? (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className="fixed bottom-6 right-6 z-50 bg-pink-500 text-white p-3 rounded-full shadow-lg hover:bg-pink-600 hover:scale-110 transition transform"
    >
      ⬆️
    </button>
  ) : null;
};

export default ScrollToTopButton;
