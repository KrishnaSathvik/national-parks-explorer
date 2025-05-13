import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success("✅ Logged in successfully!");
      navigate("/");
    } catch (err) {
      setError("❌ Invalid email or password.");
      toast.error("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded font-sans mt-10">
      <h2 className="text-2xl font-heading font-bold mb-4 text-center">🔐 Log In</h2>
      {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded shadow-sm text-sm focus:outline-none focus:ring focus:ring-blue-300"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded shadow-sm text-sm focus:outline-none focus:ring focus:ring-blue-300"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded shadow"
        >
          Log In
        </button>
      </form>

      <button
        onClick={loginWithGoogle}
        className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white py-2 rounded shadow"
      >
        Continue with Google
      </button>

      <p className="text-sm mt-4 text-center">
        Don’t have an account?{" "}
        <Link to="/signup" className="text-blue-600 underline">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;
