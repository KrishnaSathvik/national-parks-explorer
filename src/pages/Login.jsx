import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useEffect } from "react";
import { requestNotificationPermission } from "../firebase";
import { FaGoogle } from "react-icons/fa";

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 🔐 Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await login(email, password);
      const role = await resolveUserRole(userCredential.user.uid);
      showToast("✅ Logged in successfully!", "success");
      navigate(role === "admin" ? "/admin" : "/account");
    } catch (err) {
      console.error("Login Error:", err);
      handleAuthError(err);
    }
  };

  // 🔐 Google OAuth Login
  const handleGoogleLogin = async () => {
    try {
      const userCredential = await loginWithGoogle();
      const user = userCredential.user;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          role: "user",
          favoriteParks: [],
          favoriteEvents: [],
        });
      }

      const role = userSnap.data()?.role || "user";
      showToast("✅ Logged in with Google!", "success");
      navigate(role === "admin" ? "/admin" : "/account");
    } catch (err) {
      console.error("Google Login Error:", err);
      showToast("❌ Google login failed", "error");
    }
  };

  // 🧠 Role Resolver
  const resolveUserRole = async (uid) => {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data().role || "user" : "user";
  };

  // 🚨 Error Handling
  const handleAuthError = (err) => {
    let message = "❌ Login failed. Please try again.";
    if (err.code === "auth/user-not-found") message = "🙅 No account found with this email.";
    else if (err.code === "auth/wrong-password") message = "🔑 Incorrect password.";
    else if (err.code === "auth/too-many-requests") message = "⏳ Too many attempts. Try again later.";
    else if (err.code === "auth/invalid-email") message = "⚠️ Invalid email format.";

    setError(message);
    showToast(message, "error");
  };

  // 🔔 Prompt user to enable push notifications after login
  useEffect(() => {
    if (currentUser && Notification.permission !== "granted") {
      setTimeout(() => {
        showToast(
          <span
            onClick={requestNotificationPermission}
            className="cursor-pointer hover:underline"
          >
            🔔 Tap here to enable push notifications for park updates!
          </span>,
          "info"
        );
      }, 1000);
    }
  }, [currentUser]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-center mb-6 text-pink-600">
          🔐 Log In to Your Account
        </h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-full text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-full text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
            required
          />

          <button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 rounded-full shadow transition"
          >
            Log In
          </button>
        </form>

        <div className="relative my-6">
          <hr className="border-t border-gray-200" />
          <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-3 text-sm text-gray-400">
            or
          </span>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 font-medium py-3 rounded-full shadow text-sm transition flex items-center justify-center gap-2"
        >
          <FaGoogle className="text-lg" /> Continue with Google
        </button>

        <p className="text-sm mt-6 text-center text-gray-600">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-pink-500 underline hover:text-pink-600">
            Sign up
          </Link>
        </p>
        <div className="pt-6 text-center">
          <Link to="/" className="inline-block px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-full text-sm transition">
            🌲 Explore National Parks
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
