import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-pink-50 to-pink-100 py-12">
      <motion.div
        className="max-w-4xl mx-auto px-4 font-sans"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <section className="bg-white/80 backdrop-blur-md p-8 sm:p-10 rounded-3xl shadow-xl space-y-8 border border-white">
          {/* 👤 About Me */}
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-pink-600 font-heading mb-4 flex items-center gap-2">
              👋 About Me
            </h1>
            <div className="border-b border-gray-200 mb-4"></div>
            <p className="text-gray-700 text-lg leading-relaxed">
              Hi, I’m <strong>Krishna</strong>—a passionate traveler and explorer. I love visiting stunning places,
              capturing memories, and helping others discover the joy of travel through stories, tips, and reviews.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              As a proud <strong>Google Level 8 Reviewer</strong>, I’ve shared hundreds of honest insights about
              places to stay, eat, and explore. I believe in helping people make informed decisions before they set off.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Whether you’re planning a weekend escape or a cross-country adventure, I hope my experiences guide
              and inspire your next trip.
            </p>
          </div>

          {/* 🧭 About the App */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-pink-600 font-heading mb-4 flex items-center gap-2">
              🛠️ About This App
            </h2>
            <div className="border-b border-gray-200 mb-4"></div>
            <p className="text-gray-700 text-lg leading-relaxed">
              The <strong>National Parks Explorer</strong> is a passion project I built to help fellow nature lovers,
              hikers, and photographers find the best experiences in U.S. national parks.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Developed using <strong>React</strong> and <strong>Firebase</strong>, it features rich park pages,
              travel tips, seasonal info, real-time weather, interactive maps, and a travel blog—all packed into
              a beautiful, mobile-friendly design.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              My mission is simple: to encourage more people to explore the outdoors, connect with nature, and
              make unforgettable memories—one trail at a time.
            </p>
          </div>

          {/* CTA */}
          <div className="pt-6 text-center">
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-full text-base font-medium shadow transition-transform hover:scale-105"
            >
              🌲 Explore National Parks
            </Link>
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default About;
