import React from "react";
import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";

const AdminLogin = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;

      const allowedAdmins = ["krishnasathvikm@gmail.com"];
      if (allowedAdmins.includes(email)) {
        navigate("/admin");
      } else {
        alert("⛔ You are not authorized to access the admin panel.");
        auth.signOut();
      }
    } catch (error) {
      console.error("Login Error", error);
      alert("❌ Login failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-50 font-sans px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg text-center">
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-green-700 mb-4">
          🧭 Admin Portal
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Sign in with Google to continue
        </p>
        <button
          onClick={handleLogin}
          className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 font-medium py-3 rounded-full shadow text-sm transition flex items-center justify-center gap-2"
        >
          <FaGoogle className="text-lg" /> Continue with Google
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
