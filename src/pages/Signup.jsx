import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db, requestNotificationPermission } from "../firebase";
import {
  FaGoogle,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaArrowRight,
  FaSpinner,
  FaCheck,
  FaTimes,
  FaUser
} from "react-icons/fa";

const EnhancedSignup = () => {
  const { signup, loginWithGoogle, currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Validation state
  const [emailValid, setEmailValid] = useState(null);
  const [passwordValid, setPasswordValid] = useState(null);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(null);

  // Animation state
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form validation
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordStrong = (password) => {
    return password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password);
  };

  const isFormValid = emailValid && passwordValid && confirmPasswordValid && displayName.trim();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Real-time validation
  useEffect(() => {
    if (email) {
      setEmailValid(isValidEmail(email));
    } else {
      setEmailValid(null);
    }
  }, [email]);

  useEffect(() => {
    if (password) {
      setPasswordValid(password.length >= 6);
    } else {
      setPasswordValid(null);
    }
  }, [password]);

  useEffect(() => {
    if (confirmPassword) {
      setConfirmPasswordValid(password === confirmPassword);
    } else {
      setConfirmPasswordValid(null);
    }
  }, [password, confirmPassword]);

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (strength) => {
    if (strength <= 2) return "bg-red-500";
    if (strength <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = (strength) => {
    if (strength <= 2) return "Weak";
    if (strength <= 4) return "Medium";
    return "Strong";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      showToast("⚠️ Please enter a valid email address", "warning");
      return;
    }

    if (password.length < 6) {
      showToast("🔒 Password must be at least 6 characters long", "warning");
      return;
    }

    if (password !== confirmPassword) {
      showToast("🔑 Passwords don't match", "warning");
      return;
    }

    if (!displayName.trim()) {
      showToast("👤 Please enter your name", "warning");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signup(email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        email,
        displayName: displayName.trim(),
        role: "user",
        favoriteParks: [],
        favoriteEvents: [],
        createdAt: serverTimestamp(),
        profileCompleted: true,
      });

      showToast("🎉 Welcome to National Parks Explorer! Account created successfully!", "success");
      navigate("/");
    } catch (err) {
      console.error("Firebase Signup Error:", err);
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = (err) => {
    let message = "❌ Signup failed. Please try again.";

    switch (err.code) {
      case "auth/email-already-in-use":
        message = "📧 This email is already registered. Try logging in instead.";
        setError(message);
        showToast(message, "warning");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
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
  };

  const handleGoogleSignup = async () => {
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
          createdAt: serverTimestamp(),
          profileCompleted: true,
        });
        showToast("🎉 Welcome! Account created with Google!", "success");
      } else {
        showToast("✅ Welcome back! Logged in with Google!", "success");
      }

      navigate("/");
    } catch (err) {
      console.error("Google Signup Error:", err);
      showToast("❌ Google signup failed. Please try again.", "error");
    } finally {
      setGoogleLoading(false);
    }
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

  const ValidationIcon = ({ isValid }) => {
    if (isValid === null) return null;
    return isValid ?
        <FaCheck className="h-4 w-4 text-green-500" /> :
        <FaTimes className="h-4 w-4 text-red-500" />;
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center px-4 py-8">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
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
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl">🌟</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Join the Adventure!
              </h1>
              <p className="text-gray-600 text-sm">
                Start exploring 60+ national parks
              </p>
            </motion.div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex space-x-2">
                {[1, 2, 3].map((step) => (
                    <div
                        key={step}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            currentStep >= step ? 'bg-purple-500' : 'bg-gray-300'
                        }`}
                    />
                ))}
              </div>
            </div>

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
              {/* Name Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Full Name"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      setError("");
                    }}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    required
                />
              </div>

              {/* Email Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className={`w-full pl-12 pr-12 py-4 bg-gray-50 border rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                        emailValid === false ? 'border-red-300 focus:ring-red-500' :
                            emailValid === true ? 'border-green-300 focus:ring-green-500' :
                                'border-gray-200 focus:ring-purple-500'
                    }`}
                    required
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <ValidationIcon isValid={emailValid} />
                </div>
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    className={`w-full pl-12 pr-12 py-4 bg-gray-50 border rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                        passwordValid === false ? 'border-red-300 focus:ring-red-500' :
                            passwordValid === true ? 'border-green-300 focus:ring-green-500' :
                                'border-gray-200 focus:ring-purple-500'
                    }`}
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

              {/* Password Strength Indicator */}
              {password && (
                  <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Password strength:</span>
                      <span className={`font-medium ${
                          getPasswordStrength(password) <= 2 ? 'text-red-500' :
                              getPasswordStrength(password) <= 4 ? 'text-yellow-500' :
                                  'text-green-500'
                      }`}>
                    {getStrengthText(getPasswordStrength(password))}
                  </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                          className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(getPasswordStrength(password))}`}
                          style={{ width: `${(getPasswordStrength(password) / 6) * 100}%` }}
                      />
                    </div>
                  </motion.div>
              )}

              {/* Confirm Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    className={`w-full pl-12 pr-12 py-4 bg-gray-50 border rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                        confirmPasswordValid === false ? 'border-red-300 focus:ring-red-500' :
                            confirmPasswordValid === true ? 'border-green-300 focus:ring-green-500' :
                                'border-gray-200 focus:ring-purple-500'
                    }`}
                    required
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center space-x-2">
                  <ValidationIcon isValid={confirmPasswordValid} />
                  <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Sign Up Button */}
              <motion.button
                  type="submit"
                  disabled={loading || !isFormValid}
                  whileHover={{ scale: isFormValid ? 1.02 : 1 }}
                  whileTap={{ scale: isFormValid ? 0.98 : 1 }}
                  className={`w-full py-4 rounded-2xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                      isFormValid && !loading
                          ? "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl"
                          : "bg-gray-300 cursor-not-allowed"
                  }`}
              >
                {loading ? (
                    <>
                      <FaSpinner className="animate-spin h-5 w-5" />
                      Creating Account...
                    </>
                ) : (
                    <>
                      Create Account
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

            {/* Google Signup */}
            <motion.button
                onClick={handleGoogleSignup}
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
              {googleLoading ? "Creating Account..." : "Continue with Google"}
            </motion.button>

            {/* Login Link */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-center mt-8 text-gray-600"
            >
              Already have an account?{" "}
              <Link
                  to="/login"
                  className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
              >
                Sign in here
              </Link>
            </motion.p>
          </div>

          {/* Benefits Showcase */}
          <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="mt-6"
          >
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <p className="text-sm text-gray-600 mb-3 text-center">🎉 What you'll get:</p>
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span>❤️</span>
                  <span>Save Favorites</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🗺️</span>
                  <span>Trip Planning</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span>Event Notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🌟</span>
                  <span>Personalized Recommendations</span>
                </div>
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

export default EnhancedSignup;