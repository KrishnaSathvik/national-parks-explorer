// src/components/ScrollToTopButton.jsx
import React, { useEffect, useState } from "react";

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled =
        window.scrollY ||
        document.querySelector(".main-scroll")?.scrollTop ||
        0;

      setVisible(scrolled > 300);
    };

    const scrollTarget = document.querySelector(".main-scroll") || window;
    scrollTarget.addEventListener("scroll", toggleVisibility);
    return () => scrollTarget.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    const container = document.querySelector(".main-scroll");
    if (container) {
      container.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 bg-pink-500 text-white p-3 rounded-full shadow-lg hover:bg-pink-600 transition"
      title="Back to Top"
    >
      ⬆️
    </button>
  );
};

export default ScrollToTopButton;
