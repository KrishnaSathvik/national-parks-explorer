import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  FaGoogle,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaArrowRight,
  FaSpinner
} from "react-icons/fa";

const EnhancedLogin = () => {
  const { login, loginWithGoogle, currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Animation state
  const [isVisible, setIsVisible] = useState(false);

  // Form validation
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = email && password && isValidEmail(email);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await login(email, password);
      const role = await resolveUserRole(userCredential.user.uid);
      showToast("✅ Welcome back! Logged in successfully!", "success");
      navigate(role === "admin" ? "/admin" : "/");
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
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
          createdAt: new Date(),
        });
        showToast("🎉 Welcome! Account created with Google!", "success");
      } else {
        showToast("✅ Welcome back! Logged in with Google!", "success");
      }

      const role = userSnap.data()?.role || "user";
      navigate(role === "admin" ? "/admin" : "/");
    } catch (err) {
      console.error("Google login error:", err);
      showToast("❌ Google login failed. Please try again.", "error");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showToast("⚠️ Please enter your email address first", "warning");
      return;
    }

    if (!isValidEmail(email)) {
      showToast("⚠️ Please enter a valid email address", "warning");
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      showToast("📬 Password reset email sent! Check your inbox.", "success");
    } catch (err) {
      console.error("Forgot password error:", err);
      if (err.code === "auth/user-not-found") {
        showToast("❌ No account found with this email address", "error");
      } else {
        showToast("❌ Failed to send reset email. Please try again.", "error");
      }
    } finally {
      setResetLoading(false);
    }
  };

  const resolveUserRole = async (uid) => {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data().role || "user" : "user";
  };

  const handleAuthError = (err) => {
    let message = "❌ Login failed. Please try again.";
    if (err.code === "auth/user-not-found") {
      message = "🙅 No account found with this email address.";
    } else if (err.code === "auth/wrong-password") {
      message = "🔑 Incorrect password. Please try again.";
    } else if (err.code === "auth/too-many-requests") {
      message = "⏳ Too many failed attempts. Please try again later.";
    } else if (err.code === "auth/invalid-email") {
      message = "⚠️ Please enter a valid email address.";
    } else if (err.code === "auth/user-disabled") {
      message = "🚫 This account has been disabled.";
    }

    setError(message);
    showToast(message, "error");
  };

  useEffect(() => {
    if (currentUser && Notification.permission !== "granted") {
      setTimeout(() => {
        showToast(
            <span
                onClick={requestNotificationPermission}
                className="cursor-pointer hover:underline flex items-center gap-2"
            >
            🔔 Enable notifications for park updates and events!
          </span>,
            "info"
        );
      }, 2000);
    }
  }, [currentUser, showToast]);

  return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center px-4 py-8">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 w-full max-w-md"
        >
          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/20">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-center mb-8"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl">🏞️</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome Back!
              </h1>
              <p className="text-gray-600 text-sm">
                Continue your national parks adventure
              </p>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                  <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm"
                  >
                    {error}
                  </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                onSubmit={handleSubmit}
                className="space-y-5"
            >
              {/* Email Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    required
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    required
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={resetLoading}
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1 ml-auto"
                >
                  {resetLoading && <FaSpinner className="animate-spin h-3 w-3" />}
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <motion.button
                  type="submit"
                  disabled={loading || !isFormValid}
                  whileHover={{ scale: isFormValid ? 1.02 : 1 }}
                  whileTap={{ scale: isFormValid ? 0.98 : 1 }}
                  className={`w-full py-4 rounded-2xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                      isFormValid && !loading
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
                          : "bg-gray-300 cursor-not-allowed"
                  }`}
              >
                {loading ? (
                    <>
                      <FaSpinner className="animate-spin h-5 w-5" />
                      Signing in...
                    </>
                ) : (
                    <>
                      Sign In
                      <FaArrowRight className="h-4 w-4" />
                    </>
                )}
              </motion.button>
            </motion.form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or continue with</span>
              </div>
            </div>

            {/* Google Login */}
            <motion.button
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                  <FaSpinner className="animate-spin h-5 w-5 text-gray-600" />
              ) : (
                  <FaGoogle className="h-5 w-5 text-red-500" />
              )}
              {googleLoading ? "Connecting..." : "Continue with Google"}
            </motion.button>

            {/* Sign Up Link */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-center mt-8 text-gray-600"
            >
              Don't have an account?{" "}
              <Link
                  to="/signup"
                  className="text-pink-600 hover:text-pink-700 font-semibold transition-colors"
              >
                Sign up for free
              </Link>
            </motion.p>
          </div>

          {/* Additional Features */}
          <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="mt-6 text-center"
          >
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <p className="text-sm text-gray-600 mb-2">✨ New to National Parks Explorer?</p>
              <div className="flex justify-center space-x-6 text-xs text-gray-500">
                <span>🏞️ 60+ Parks</span>
                <span>📅 Live Events</span>
                <span>🗺️ Trip Planning</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
      </div>
  );
};

export default EnhancedLogin;