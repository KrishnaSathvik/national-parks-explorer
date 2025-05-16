import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await login(email, password);
      const uid = userCredential.user.uid;
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      let role = "user";
      if (userSnap.exists()) {
        role = userSnap.data().role || "user";
      }

      showToast("✅ Logged in successfully!", "success");

      navigate(role === "admin" ? "/admin" : "/account");
    } catch (err) {
      console.error("Firebase Login Error:", err);

      let message = "❌ Login failed. Please try again.";
      if (err.code === "auth/user-not-found") {
        message = "🙅 No account found with this email.";
      } else if (err.code === "auth/wrong-password") {
        message = "🔑 Incorrect password. Please try again.";
      } else if (err.code === "auth/too-many-requests") {
        message = "⏳ Too many attempts. Try again later.";
      } else if (err.code === "auth/invalid-email") {
        message = "⚠️ Invalid email address format.";
      }

      setError(message);
      showToast(message, "error");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const userCredential = await loginWithGoogle();
      const user = userCredential.user;
      const uid = user.uid;
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      let role = "user";

      if (userSnap.exists()) {
        role = userSnap.data().role || "user";
      } else {
        // Create user doc if not exists
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          role: "user",
          favoriteParks: [],
          favoriteEvents: [],
        });
      }

      showToast("✅ Logged in with Google!", "success");

      navigate(role === "admin" ? "/admin" : "/account");
    } catch (err) {
      console.error("Google Login Error:", err);
      showToast("❌ Google login failed", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-heading font-bold mb-6 text-center text-pink-600">
          🔐 Log In to Your Account
        </h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            required
          />

          <button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 rounded-full shadow transition"
          >
            Log In
          </button>
        </form>

        <div className="my-4 text-center text-sm text-gray-500">OR</div>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-full shadow text-sm transition"
        >
          Continue with Google
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
