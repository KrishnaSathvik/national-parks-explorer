import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useIsMobile from "../hooks/useIsMobile";
import { FaMapMarkedAlt, FaCameraRetro, FaGlobeAmericas } from "react-icons/fa";

const About = () => {
  const isMobile = useIsMobile(); // ⬅️ Fix: call inside component

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
              Hi, I’m <strong>Krishna</strong> — a passionate traveler, national park explorer, and night sky chaser.
              For me, travel is not just about checking places off a list, but about the stories, the solitude, and
              the wonder you carry back with you.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              As a proud <strong>Google Level 8 Contributor</strong>, I’ve shared hundreds of reviews and photos to
              help others plan meaningful trips. You can check out my profile&nbsp;
              <a
                href="https://maps.app.goo.gl/wUwoducR3tG9Z7n38?g_st=i"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                here →
              </a>
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              I’m also an <strong>Astro & Landscape Photographer</strong> capturing the magic of the Milky Way,
              sunrises over canyons, and reflections in alpine lakes. You can view some of my favorite moments on my&nbsp;
              <a
                href="https://unsplash.com/@astrobykrishna"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Unsplash Portfolio →
              </a>
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              This site is my way of giving back to the travel community — to help others find their trail, their
              silence, their awe.
            </p>
          </div>

          {/* 🛠️ About the App */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-pink-600 font-heading mb-4 flex items-center gap-2">
              🛠️ About This App
            </h2>
            <div className="border-b border-gray-200 mb-4"></div>
            <p className="text-gray-700 text-lg leading-relaxed">
              <strong>National Parks Explorer</strong> is a labor of love. Built using <strong>React</strong> and
              <strong> Firebase</strong>, it brings together detailed park info, real-time weather, curated blog
              stories, interactive maps, reviews, seasonal highlights, and more — all designed with travelers in mind.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              It’s more than a guide. It’s a tool to help people discover the outdoors and reconnect with the natural
              world — one park, one hike, one sunset at a time.
            </p>
          </div>

          {/* 🧭 My Roles */}
          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6 text-center mt-10">
            <div className="bg-white border rounded-xl shadow p-6">
              <FaMapMarkedAlt className="text-pink-500 text-3xl mx-auto mb-2" />
              <h3 className="font-bold text-lg mb-1">Google Maps Contributor</h3>
              <a
                href="https://maps.app.goo.gl/wUwoducR3tG9Z7n38?g_st=i"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                View Level 8 Profile →
              </a>
            </div>

            <div className="bg-white border rounded-xl shadow p-6">
              <FaCameraRetro className="text-pink-500 text-3xl mx-auto mb-2" />
              <h3 className="font-bold text-lg mb-1">Astro & Landscape Photographer</h3>
              <a
                href="https://unsplash.com/@astrobykrishna"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                View Unsplash Portfolio →
              </a>
            </div>

            <div className="bg-white border rounded-xl shadow p-6">
              <FaGlobeAmericas className="text-pink-500 text-3xl mx-auto mb-2" />
              <h3 className="font-bold text-lg mb-1">Explorer & Builder</h3>
              <p className="text-sm text-gray-600">
                I created this app to make it easier for others to plan authentic, awe-filled adventures.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-10 text-center space-y-3">
            {!isMobile && (
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-gray-800 border hover:bg-pink-50 hover:text-pink-600 transition text-sm sm:text-base font-medium shadow"
              >
                🌲 Explore National Parks
              </Link>
            )}
            <p className="mt-4 text-xs text-gray-400">
              Made under starry skies, powered by passion for the wild.
            </p>
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default About;
