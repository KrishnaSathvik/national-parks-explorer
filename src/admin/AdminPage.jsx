import React from "react";
import { Link } from "react-router-dom";
import { FaPen, FaImages, FaUsers, FaStar, FaCalendar, FaBook } from "react-icons/fa";

const adminSections = [
  { path: "/admin/editor", icon: <FaPen />, label: "Blog Editor" },
  { path: "/admin/media", icon: <FaImages />, label: "Media Manager" },
  { path: "/admin/users", icon: <FaUsers />, label: "User Management" },
  { path: "/admin/reviews", icon: <FaStar />, label: "Review Moderation" },
  { path: "/admin/events", icon: <FaCalendar />, label: "Events Manager" },
  { path: "/admin/edit-blog", icon: <FaBook />, label: "Edit Blog Posts" },
];

const AdminPage = () => {
  return (
    <div className="min-h-screen px-4 py-10 bg-gray-50 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-green-700 mb-8 text-center">
          ⚙️ Admin Dashboard
        </h1>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {adminSections.map((section) => (
            <Link
              key={section.path}
              to={section.path}
              className="flex items-center justify-center gap-3 px-6 py-5 bg-white border rounded-2xl shadow hover:shadow-md transition hover:scale-[1.02] text-gray-800 text-sm sm:text-base font-medium"
            >
              <span className="text-xl">{section.icon}</span>
              {section.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
