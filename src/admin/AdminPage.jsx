import React, { useState } from "react";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Dashboard from "./Dashboard";
import ReviewModeration from "./ReviewModeration";
import UserManagement from "./UserManagement";
import { signOut } from "firebase/auth";
import MediaManager from "./MediaManager";
import EventsManager from "./EventsManager";
import AdminBlogEditor from "./AdminBlogEditor";
import { Link } from "react-router-dom";


const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user] = useAuthState(auth);

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "reviews":
        return <ReviewModeration />;
      case "users":
        return <UserManagement />;
      case "media":
        return <MediaManager />;
      case "events":
        return <EventsManager />;
      case "blog":
          return <AdminBlogEditor />;
      default:
        return <Dashboard />;
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (

    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top Bar */}
      <div className="p-6 border-b flex flex-wrap gap-4 items-center justify-between bg-white shadow">
        <div className="flex gap-4 items-center flex-wrap">
          <h1 className="text-2xl font-bold text-green-700 mr-4">🧭 Admin Panel</h1>
          <button className={tabClass(activeTab === "dashboard")} onClick={() => setActiveTab("dashboard")}>
            📊 Dashboard
          </button>
          <button className={tabClass(activeTab === "reviews")} onClick={() => setActiveTab("reviews")}>
            🛠 Reviews
          </button>
          <button className={tabClass(activeTab === "users")} onClick={() => setActiveTab("users")}>
            👥 Users
          </button>
          <button className={tabClass(activeTab === "media")} onClick={() => setActiveTab("media")}>
            🖼 Media
          </button>
          <button
            className={tabClass(activeTab === "events")} onClick={() => setActiveTab("events")}>
            🎪 Events
          </button>
          <button className={tabClass(activeTab === "blog")} onClick={() => setActiveTab("blog")}>
            ✍️ Blog
          </button>
          <Link to="/" className="inline-block px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-full text-sm transition">
            🌲 Explore National Parks
          </Link>
        </div>

        {/* Admin Info + Logout */}
        <div className="flex items-center gap-4">
          {user && <span className="text-sm text-gray-600">🔐 {user.email}</span>}
          <button
            onClick={handleLogout}
            className="text-red-600 text-sm font-medium hover:underline"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="p-6">{renderTab()}</div>
    </div>
  );
};

const tabClass = (isActive) =>
  `px-4 py-2 rounded-lg ${
    isActive ? "bg-green-100 text-green-800 font-semibold" : "text-gray-600 hover:text-green-700"
  }`;
export default AdminPage;
