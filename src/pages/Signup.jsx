import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(email, password);
      toast.success("🎉 Account created successfully!");
      navigate("/");
    } catch (err) {
      setError("❌ Signup failed. Please try again.");
      toast.error("Signup failed. Try a different email or password.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded font-sans mt-10">
      <h2 className="text-2xl font-heading font-bold mb-4 text-center">📝 Sign Up</h2>
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded shadow"
        >
          Sign Up
        </button>
      </form>

      <p className="text-sm mt-4 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 underline">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default Signup;
