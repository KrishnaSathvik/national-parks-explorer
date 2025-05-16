import React from "react";
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
      <main className="flex-grow main-scroll max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
