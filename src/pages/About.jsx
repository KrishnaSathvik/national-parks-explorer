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
      {/* 📄 About Content */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-md space-y-6">
        {/* 👤 About Me Section */}
        <header>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-pink-600 mb-4">👋 About Me</h1>
        </header>
        <p className="text-gray-700 text-base leading-relaxed">
          Hi, I’m <strong>Krishna</strong>—a passionate traveler and explorer. I love visiting stunning places,
          capturing memories, and helping others discover the joy of travel through stories, tips, and reviews.
        </p>
        <p className="text-gray-700 text-base leading-relaxed">
          As a proud <strong>Google Level 8 Reviewer</strong>, I’ve shared hundreds of honest insights about
          places to stay, eat, and explore. I believe in helping people make informed decisions before they set off.
        </p>
        <p className="text-gray-700 text-base leading-relaxed">
          Whether you’re planning a weekend escape or a cross-country adventure, I hope my experiences guide
          and inspire your next trip.
        </p>

        {/* 🧭 About the App Section */}
        <header className="pt-6">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-pink-600 mt-6">🛠️ About This App</h2>
        </header>
        <p className="text-gray-700 text-base leading-relaxed">
          The <strong>National Parks Explorer</strong> is a passion project I built to help fellow nature lovers,
          hikers, and photographers find the best experiences in U.S. national parks.
        </p>
        <p className="text-gray-700 text-base leading-relaxed">
          Developed using <strong>React</strong> and <strong>Firebase</strong>, it features rich park pages,
          travel tips, seasonal info, real-time weather, interactive maps, and a travel blog—all packed into
          a beautiful, mobile-friendly design.
        </p>
        <p className="text-gray-700 text-base leading-relaxed">
          My mission is simple: to encourage more people to explore the outdoors, connect with nature, and
          make unforgettable memories—one trail at a time.
        </p>
        <div className="pt-6 text-center">
          <Link to="/" className="inline-block px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-full text-sm transition">
            🌲 Explore National Parks
          </Link>
        </div>
      </section>
    </motion.div>
  );
};

export default About;
