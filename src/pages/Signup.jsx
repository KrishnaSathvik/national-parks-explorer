import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { FaGoogle } from "react-icons/fa";
import { useEffect } from "react";
import { requestNotificationPermission } from "../firebase";


const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signup, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [error, setError] = useState("");



  // ✨ Email/Password Signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signup(email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        email,
        displayName: "",
        role: "user",
        favoriteParks: [],
        favoriteEvents: [],
      });

      showToast("🎉 Account created successfully!", "success");
      navigate("/account");
    } catch (err) {
      console.error("Firebase Signup Error:", err);
      let message = "❌ Signup failed. Please try again.";

      if (err.code === "auth/email-already-in-use") {
        message = "📧 Email already in use. Try logging in.";
      } else if (err.code === "auth/invalid-email") {
        message = "⚠️ Invalid email address format.";
      } else if (err.code === "auth/weak-password") {
        message = "🔒 Password should be at least 6 characters.";
      } else if (err.code === "auth/operation-not-allowed") {
        message = "❌ Email/Password sign-up is not enabled in Firebase.";
      }

      setError(message);
      showToast(message, "error");
    }
  };

  // 🔐 Google OAuth Signup
  const handleGoogleSignup = async () => {
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

      showToast("✅ Signed up with Google!", "success");
      navigate("/account");
    } catch (err) {
      console.error("Google Signup Error:", err);
      showToast("❌ Google signup failed", "error");
    }
  };

  // 🔔 Prompt user to enable push notifications after sign-up
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl transition duration-300 hover:scale-[1.01]">

        {/* 🖼️ Logo + Welcome Message */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/logo.png"
            alt="National Parks Explorer"
            className="w-20 h-20 mb-3"
          />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-700 text-center">
            Welcome to <span className="text-pink-600">National Parks Explorer</span>
          </h1>
        </div>

        {/* 📝 Form Heading */}
        <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-center mb-6 text-pink-600">
          📝 Create Your Account
        </h2>
        {error && (
          <div className="text-red-500 text-sm mb-4 text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="sr-only" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              autoFocus
              className="w-full px-4 py-3 border border-gray-300 rounded-full text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              required
            />
          </div>

          <div>
            <label className="sr-only" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-full text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 rounded-full shadow-md transition"
          >
            Sign Up
          </button>
        </form>

        <div className="relative my-6">
          <hr className="border-t border-gray-200" />
          <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-3 text-sm text-gray-400">
            or
          </span>
        </div>

        <button
          onClick={handleGoogleSignup}
          className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 font-medium py-3 rounded-full shadow text-sm transition flex items-center justify-center gap-2"
        >
          <FaGoogle className="text-lg" /> Continue with Google
        </button>

        <p className="text-sm text-center mt-6 text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-pink-500 font-medium underline hover:text-pink-600">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
