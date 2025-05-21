import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";
import {
  sendPasswordResetEmail
} from "firebase/auth";
import { db, requestNotificationPermission, auth } from "../firebase";
import { FaGoogle } from "react-icons/fa";

const Login = () => {
  const { login, loginWithGoogle, currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await login(email, password);
      const role = await resolveUserRole(userCredential.user.uid);
      showToast("✅ Logged in successfully!", "success");
      navigate(role === "admin" ? "/admin" : "/");
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const userCredential = await loginWithGoogle();
      const user = userCredential.user;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName || "",
          role: "user",
          favoriteParks: [],
          favoriteEvents: [],
        });
        showToast("🎉 Account created with Google!", "success");
      } else {
        showToast("✅ Logged in with Google!", "success");
      }

      const role = userSnap.data()?.role || "user";
      navigate(role === "admin" ? "/admin" : "/");
    } catch (err) {
      console.error("Google login error:", err);
      showToast("❌ Google login failed", "error");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showToast("⚠️ Please enter your email first", "warning");
      return;
    }

    if (!isValidEmail(email)) {
      showToast("⚠️ Invalid email format", "warning");
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      showToast("📬 Password reset email sent!", "success");
    } catch (err) {
      console.error("Forgot password error:", err);
      showToast("❌ Failed to send reset email", "error");
    } finally {
      setLoading(false);
    }
  };

  const resolveUserRole = async (uid) => {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data().role || "user" : "user";
  };

  const handleAuthError = (err) => {
    let message = "❌ Login failed.";
    if (err.code === "auth/user-not-found") message = "🙅 No account with this email.";
    else if (err.code === "auth/wrong-password") message = "🔑 Wrong password.";
    else if (err.code === "auth/too-many-requests") message = "⏳ Too many attempts.";
    else if (err.code === "auth/invalid-email") message = "⚠️ Invalid email.";

    setError(message);
    showToast(message, "error");
  };

  useEffect(() => {
    if (currentUser && Notification.permission !== "granted") {
      setTimeout(() => {
        showToast(
          <span
            onClick={requestNotificationPermission}
            className="cursor-pointer hover:underline"
          >
            🔔 Tap here to enable push notifications!
          </span>,
          "info"
        );
      }, 1000);
    }
  }, [currentUser, showToast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md transition duration-300 hover:scale-[1.01]">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" alt="National Parks Explorer" className="w-20 h-20 mb-3" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-700 text-center">
            Welcome to <span className="text-pink-600">National Parks Explorer</span>
          </h1>
        </div>

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

          <div className="text-right text-sm">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-blue-500 hover:underline"
              disabled={loading}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 rounded-full shadow transition"
            disabled={loading}
          >
            {loading ? "Loading..." : "Log In"}
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
          disabled={loading}
        >
          <FaGoogle className="text-lg" /> Continue with Google
        </button>

        <p className="text-sm mt-6 text-center text-gray-600">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-pink-500 underline hover:text-pink-600">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
