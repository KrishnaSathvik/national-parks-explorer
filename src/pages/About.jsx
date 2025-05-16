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
      {/* Back to Home Link at the Top */}
      <div className="mb-4">
        <Link to="/" className="text-blue-600 hover:underline text-sm">
          ← Back to Home
        </Link>
      </div>

      {/* About Content */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
        <h1 className="text-4xl font-bold text-pink-600">👋 About Me</h1>
        <p className="text-gray-700 text-md leading-relaxed">
          Hello everyone, I'm <strong>Krishna</strong>, a travel enthusiast who loves exploring new places
          and sharing my experiences with others. From beautiful destinations to insightful travel tips, my
          blog is the perfect place to find inspiration for your next adventure.
        </p>
        <p className="text-gray-700 text-md leading-relaxed">
          I'm thrilled to share all my travel experiences, curated with accurate reviews and insightful tips.
          As a <strong>Google Level 8 reviewer</strong>, I've made it my mission to help users navigate and explore
          the world, ensuring they have the best possible travel experiences.
        </p>
        <p className="text-gray-700 text-md leading-relaxed">
          Being a Level 8 reviewer means I've dedicated countless hours to crafting accurate and valuable
          reviews—whether it's rating accommodations, restaurants, and attractions, or giving useful tips.
          Nothing makes me happier than knowing my insights have helped someone create their perfect vacation.
        </p>

        <h2 className="text-3xl font-bold text-pink-600 pt-6">🛠️ About This App</h2>
        <p className="text-gray-700 text-md leading-relaxed">
          This National Parks Explorer application is a passion project I built to help nature lovers, hikers,
          and travelers like myself discover the beauty of America's National Parks. I've spent countless hours
          building features like detailed park info, reviews, seasonal highlights, weather forecasts, travel tips,
          and even a blog system—all using React, Firebase, and modern web tools.
        </p>
        <p className="text-gray-700 text-md leading-relaxed">
          Every line of code reflects my love for travel and my commitment to creating something meaningful for
          the community. I hope this app inspires you to get out and explore the natural wonders around you.
        </p>
      </div>
    </motion.div>
  );
};

export default About;
