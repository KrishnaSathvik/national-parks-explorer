// src/admin/AdminRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

const allowedAdmins = ["krishnasathvikm@gmail.com"];

const AdminRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 font-sans">
        ⏳ Authenticating admin...
      </div>
    );

  if (!user || !allowedAdmins.includes(user.email)) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminRoute;
