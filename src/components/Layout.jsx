import React from "react";
import Footer from "./Footer";
import ScrollToTopButton from "./ScrollToTopButton";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-white via-pink-50 to-white">
      <main className="flex-grow main-scroll max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {children}
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default Layout;