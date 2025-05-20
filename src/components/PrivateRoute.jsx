// ✅ PrivateRoute.jsx – Protect routes from unauthenticated access
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();

  // 🚫 Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Allow access
  return children;
};

export default PrivateRoute;
