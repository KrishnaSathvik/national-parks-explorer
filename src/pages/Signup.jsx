import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, requestNotificationPermission } from "../firebase";
import { FaGoogle } from "react-icons/fa";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signup, loginWithGoogle, currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // In your handleSubmit function, replace the error handling section with this:

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      showToast("⚠️ Invalid email format", "warning");
      return;
    }

    if (password.length < 6) {
      showToast("🔒 Password should be at least 6 characters", "warning");
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signup(email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        email,
        displayName: "",
        role: "user",
        favoriteParks: [],
        favoriteEvents: [],
        createdAt: serverTimestamp(),
      });

      showToast("🎉 Account created successfully!", "success");
      navigate("/");
    } catch (err) {
      console.error("Firebase Signup Error:", err);
      let message = "❌ Signup failed. Please try again.";

      // Better error handling for common Firebase auth errors
      switch (err.code) {
        case "auth/email-already-in-use":
          message = "📧 This email is already registered. Try logging in instead.";
          setError(message);
          showToast(message, "warning");
          // Auto-redirect to login after 2 seconds
          setTimeout(() => {
            navigate("/login");
          }, 2000);
          break;
          
        case "auth/invalid-email":
          message = "⚠️ Please enter a valid email address.";
          break;
          
        case "auth/weak-password":
          message = "🔒 Password should be at least 6 characters long.";
          break;
          
        case "auth/operation-not-allowed":
          message = "❌ Email/Password signup is not enabled. Please contact support.";
          break;
          
        case "auth/network-request-failed":
          message = "🌐 Network error. Please check your connection and try again.";
          break;
          
        case "auth/too-many-requests":
          message = "⏳ Too many signup attempts. Please wait a moment and try again.";
          break;
          
        default:
          message = "❌ Signup failed. Please try again.";
          console.error("Unhandled auth error:", err.code, err.message);
      }

      if (err.code !== "auth/email-already-in-use") {
        setError(message);
        showToast(message, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔐 Google OAuth Signup
  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
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
        showToast("🎉 Google account created!", "success");
      } else {
        showToast("✅ Logged in with Google!", "success");
      }

      navigate("/");
    } catch (err) {
      console.error("Google Signup Error:", err);
      showToast("❌ Google signup failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔔 Prompt push notifications
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
  }, [currentUser, showToast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl transition duration-300 hover:scale-[1.01]">
        {/* 🖼️ Logo + Welcome Message */}
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" alt="National Parks Explorer" className="w-20 h-20 mb-3" />
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

          <button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 rounded-full shadow-md transition"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
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
          disabled={loading}
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
