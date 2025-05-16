import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const About = () => {
  return (
    <motion.div
      className="max-w-4xl mx-auto px-4 py-10 font-sans"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* 🔙 Back Button */}
      <div className="mb-4">
        <Link to="/" className="text-blue-600 hover:underline text-sm">
          ← Back to Home
        </Link>
      </div>

      {/* 📄 About Content Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md space-y-6">
        {/* 👤 About Me Section */}
        <h1 className="text-4xl font-extrabold text-pink-600">👋 About Me</h1>
        <p className="text-gray-700 text-base leading-relaxed">
          Hello everyone, I'm <strong>Krishna</strong>, a travel enthusiast who loves exploring new places
          and sharing my experiences with others. From beautiful destinations to insightful travel tips,
          my blog is the perfect place to find inspiration for your next adventure.
        </p>
        <p className="text-gray-700 text-base leading-relaxed">
          I'm thrilled to share all my travel experiences, curated with accurate reviews and helpful insights.
          As a <strong>Google Level 8 reviewer</strong>, I’ve dedicated countless hours to writing detailed,
          honest reviews—whether it’s for accommodations, restaurants, attractions, or hidden gems.
        </p>
        <p className="text-gray-700 text-base leading-relaxed">
          Helping others plan unforgettable trips brings me joy. Whether you're a weekend explorer or a
          seasoned traveler, I hope my tips make your journeys smoother and more memorable.
        </p>

        {/* 🧭 About the App Section */}
        <h2 className="text-3xl font-bold text-pink-600 pt-6">🛠️ About This App</h2>
        <p className="text-gray-700 text-base leading-relaxed">
          This <strong>National Parks Explorer</strong> app is a labor of love—designed to make it easier for
          nature lovers, hikers, and road trippers to discover the magic of U.S. National Parks.
        </p>
        <p className="text-gray-700 text-base leading-relaxed">
          Built entirely using <strong>React</strong>, <strong>Firebase</strong>, and modern tools, the app features
          detailed park pages, seasonal guides, interactive maps, user reviews, weather updates, a travel blog,
          and more—all wrapped in a clean, mobile-friendly interface.
        </p>
        <p className="text-gray-700 text-base leading-relaxed">
          Every piece of this project—from design to deployment—was handcrafted with a deep love for both travel
          and technology. My goal is to build a community of explorers who can share, learn, and be inspired to
          visit these breathtaking landscapes.
        </p>
      </div>
    </motion.div>
  );
};

export default About;
