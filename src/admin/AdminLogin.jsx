import React from "react";
import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;

      // Whitelist check (update your email here)
      const allowedAdmins = ["krishnasathvikm@gmail.com"];
      if (allowedAdmins.includes(email)) {
        navigate("/admin");
      } else {
        alert("⛔ You are not authorized to access the admin panel.");
        auth.signOut();
      }
    } catch (error) {
      console.error("Login Error", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white rounded-2xl shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Admin Portal</h1>
        <p className="mb-6 text-gray-600">Sign in with Google to continue</p>
        <button
          onClick={handleLogin}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
