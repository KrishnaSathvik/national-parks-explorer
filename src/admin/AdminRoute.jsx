// src/admin/AdminRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

const allowedAdmins = ["krishnasathvikm@gmail.com"]; // Change this to your admin email

const AdminRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div>Loading...</div>;

  if (!user || !allowedAdmins.includes(user.email)) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminRoute;
