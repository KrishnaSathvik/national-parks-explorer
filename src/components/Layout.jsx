import React from "react";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Wrap the content in a scrollable div */}
      <main className="main-scroll max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
};

export default Layout;
