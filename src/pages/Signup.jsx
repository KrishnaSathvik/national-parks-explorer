import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signup(email, password);
      const uid = userCredential.user.uid;

      // Create Firestore user document
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, {
        email,
        displayName: "", // optional: add name input if needed
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl transition-transform duration-300 hover:scale-[1.01]">
        <h2 className="text-3xl font-heading font-bold mb-6 text-center text-pink-600">
          📝 Create Your Account
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            autoFocus
            className="w-full px-4 py-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            required
          />

          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 rounded-full shadow-md transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-pink-500 font-medium underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
