import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useIsMobile from "../hooks/useIsMobile";
import FadeInWrapper from "../components/FadeInWrapper";
import { useToast } from "../context/ToastContext";
import {
  FaMapMarkedAlt,
  FaCameraRetro,
  FaGlobeAmericas,
  FaHeart,
  FaStar,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaEye,
  FaDownload,
  FaShare,
  FaChevronLeft,
  FaChevronRight,
  FaQuoteLeft,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaEnvelope,
  FaArrowLeft,
  FaRoute,
  FaNewspaper,
  FaTrophy,
  FaCamera,
  FaMountain,
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute
} from "react-icons/fa";

const About = () => {
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // State for interactive features
  const [statsAnimated, setStatsAnimated] = useState(false);

  // Animated stats
  const [animatedStats, setAnimatedStats] = useState({
    mapContributions: 0,
    photosShared: 0,
    parksVisited: 0,
    yearsExperience: 0
  });

  // Real data based on your Google Maps profile
  const stats = {
    mapContributions: 372, // From your Google Maps reviews
    photosShared: 6537, // From your Google Maps photos
    parksVisited: 15, // Your actual national parks count
    yearsExperience: 5 // 2020-2025
  };

  const socialLinks = [
    {
      icon: FaInstagram,
      label: "Instagram",
      url: "https://instagram.com/astrobykrishna",
      color: "from-pink-500 to-purple-500"
    },
    {
      icon: FaGlobeAmericas,
      label: "Unsplash Portfolio",
      url: "https://unsplash.com/@astrobykrishna",
      color: "from-gray-600 to-gray-800"
    },
    {
      icon: FaMapMarkedAlt,
      label: "Google Maps Level 8",
      url: "https://maps.app.goo.gl/MX71pvtv23ubGheW7?g_st=ic",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: FaEnvelope,
      label: "Email",
      url: "mailto:travelswithkrishna@gmail.com",
      color: "from-green-500 to-emerald-500"
    }
  ];

  // Animate stats on scroll
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatsAnimated(true);
      // Animate numbers
      const duration = 2000;
      const steps = 50;
      const stepDuration = duration / steps;

      Object.keys(stats).forEach(key => {
        let currentValue = 0;
        const targetValue = stats[key];
        const increment = targetValue / steps;

        const interval = setInterval(() => {
          currentValue += increment;
          if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(interval);
          }
          setAnimatedStats(prev => ({
            ...prev,
            [key]: Math.floor(currentValue)
          }));
        }, stepDuration);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Enhanced Hero Section
  const renderHeroSection = () => (
      <div className="relative bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 p-4 md:p-8 text-white overflow-hidden rounded-2xl mb-8">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -top-2 -left-2 w-24 h-24 bg-white/10 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full blur-md animate-bounce delay-2000"></div>

        <div className="relative z-10">
          <FadeInWrapper delay={0.1}>
            <div className={`flex ${isMobile ? 'flex-col text-center' : 'flex-row items-center'} gap-6`}>
              {/* Avatar */}
              <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.8, type: "spring" }}
                  className={`${isMobile ? 'mx-auto' : ''} relative`}
              >
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 p-1">
                  <div className="w-full h-full rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-6xl md:text-7xl">
                    👨‍💻
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </motion.div>

              {/* Hero Content */}
              <div className="flex-1">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`font-extrabold mb-4 ${isMobile ? 'text-3xl' : 'text-4xl lg:text-6xl'}`}
                >
                  👋 Hey, I'm Krishna
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className={`space-y-3 ${isMobile ? 'text-base' : 'text-lg lg:text-xl'}`}
                >
                  <p className="text-purple-100">
                    🏞️ <strong>15 National Parks Explored</strong> • 📸 <strong>Nikon Z6ii Astrophotographer</strong> • 🗺️ <strong>Google Level 8 Contributor</strong>
                  </p>
                  <p className="text-white/90 leading-relaxed">
                    From my first Grand Canyon visit in 2020 to capturing the Milky Way over Big Bend in 2025,
                    I share the incredible beauty of our national parks through detailed reviews and astrophotography.
                  </p>
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4 mt-6`}
                >
                  <div className="text-center">
                    <div className="font-bold text-2xl text-yellow-300">{animatedStats.parksVisited}</div>
                    <div className="text-sm text-purple-200">Parks Visited</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-2xl text-green-300">{animatedStats.mapContributions}</div>
                    <div className="text-sm text-purple-200">Reviews</div>
                  </div>
                  {!isMobile && (
                      <>
                        <div className="text-center">
                          <div className="font-bold text-2xl text-blue-300">{animatedStats.photosShared > 1000 ? `${(animatedStats.photosShared/1000).toFixed(1)}k` : animatedStats.photosShared}</div>
                          <div className="text-sm text-purple-200">Photos</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-2xl text-pink-300">{animatedStats.yearsExperience}</div>
                          <div className="text-sm text-purple-200">Years Experience</div>
                        </div>
                      </>
                  )}
                </motion.div>
              </div>
            </div>
          </FadeInWrapper>
        </div>
      </div>
  );

  // Stats Dashboard
  const renderStatsSection = () => (
      <FadeInWrapper delay={0.2}>
        <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4 mb-8">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-500 to-emerald-500 p-4 md:p-6 rounded-2xl text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <FaMapMarkerAlt className="text-2xl md:text-3xl" />
              <div className="text-xs bg-white/20 px-2 py-1 rounded-full">Live</div>
            </div>
            <div className="font-bold text-xl md:text-2xl mb-1">{animatedStats.parksVisited}</div>
            <div className="text-white/90 text-sm font-medium">Parks Explored</div>
            <div className="text-white/70 text-xs mt-1">Across 23 states</div>
          </motion.div>

          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 md:p-6 rounded-2xl text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <FaMapMarkedAlt className="text-2xl md:text-3xl" />
              <div className="text-xs bg-white/20 px-2 py-1 rounded-full">Level 8</div>
            </div>
            <div className="font-bold text-xl md:text-2xl mb-1">{animatedStats.mapContributions}</div>
            <div className="text-white/90 text-sm font-medium">Reviews Written</div>
            <div className="text-white/70 text-xs mt-1">2.2M+ views</div>
          </motion.div>

          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 md:p-6 rounded-2xl text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <FaCameraRetro className="text-2xl md:text-3xl" />
              <div className="text-xs bg-white/20 px-2 py-1 rounded-full">Active</div>
            </div>
            <div className="font-bold text-xl md:text-2xl mb-1">{animatedStats.photosShared}</div>
            <div className="text-white/90 text-sm font-medium">Photos Shared</div>
            <div className="text-white/70 text-xs mt-1">47M+ views</div>
          </motion.div>

          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-yellow-500 to-orange-500 p-4 md:p-6 rounded-2xl text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <FaTrophy className="text-2xl md:text-3xl" />
              <div className="text-xs bg-white/20 px-2 py-1 rounded-full">Growing</div>
            </div>
            <div className="font-bold text-xl md:text-2xl mb-1">{animatedStats.yearsExperience}</div>
            <div className="text-white/90 text-sm font-medium">Years Experience</div>
            <div className="text-white/70 text-xs mt-1">And counting</div>
          </motion.div>
        </div>
      </FadeInWrapper>
  );

  // Social Links & Contact
  const renderSocialSection = () => (
      <FadeInWrapper delay={0.3}>
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <h3 className={`font-bold text-gray-800 mb-6 ${isMobile ? 'text-lg' : 'text-xl'}`}>
            🌐 Connect With Me
          </h3>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            {socialLinks.map((link, index) => (
                <motion.a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-4 p-3 bg-gradient-to-r ${link.color} text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                    onClick={() => showToast(`Opening ${link.label}...`, "info")}
                >
                  <link.icon className="text-xl" />
                  <div>
                    <div className="font-semibold">{link.label}</div>
                    <div className="text-sm opacity-90">
                      {link.label === 'Google Maps Level 8' && 'Level 8 • 2.2M+ review views'}
                      {link.label === 'Unsplash Portfolio' && '25+ Astrophotography shots'}
                      {link.label === 'Instagram' && '@astrobykrishna'}
                      {link.label === 'Email' && 'travelswithkrishna@gmail.com'}
                    </div>
                  </div>
                </motion.a>
            ))}
          </div>
        </div>
      </FadeInWrapper>
  );

  // App Information
  const renderAppSection = () => (
      <FadeInWrapper delay={0.4}>
        <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-200 mb-8">
          <h3 className={`font-bold text-gray-800 mb-6 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            🛠️ About This App
          </h3>
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <div>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>National Parks Explorer</strong> is my way of giving back to the travel community.
                Built with <strong>React</strong> and <strong>Firebase</strong>, it combines real-time weather data,
                detailed park information, interactive maps, and personal recommendations.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Every feature is designed with fellow travelers in mind - from trip planning tools to
                seasonal guides and AI-powered recommendations.
              </p>

              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">React</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">Firebase</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Weather API</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">NPS API</span>
                <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">Framer Motion</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100">
              <h4 className="font-bold text-gray-800 mb-3">🚀 Key Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  Real-time weather forecasts
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Interactive trip planning
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Seasonal recommendations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  User reviews & ratings
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Mobile-first design
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  AI-powered suggestions
                </li>
              </ul>
            </div>
          </div>
        </div>
      </FadeInWrapper>
  );

  // Navigation Actions
  const renderNavigationSection = () => (
      <FadeInWrapper delay={0.5}>
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-6 rounded-2xl text-white">
          <div className="text-center mb-6">
            <h3 className={`font-bold mb-2 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              🌟 Ready to Explore?
            </h3>
            <p className="text-purple-100">
              Start your national parks adventure today
            </p>
          </div>

          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
            <motion.button
                whileHover={{ scale: isMobile ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  navigate('/');
                  showToast('🏞️ Happy exploring!', 'success');
                }}
                className="flex items-center justify-center gap-3 bg-white/20 backdrop-blur-sm p-4 rounded-xl hover:bg-white/30 transition-all"
            >
              <FaArrowLeft />
              <div className="text-left">
                <div className="font-semibold">Explore Parks</div>
                <div className="text-sm opacity-90">Browse all destinations</div>
              </div>
            </motion.button>

            <motion.button
                whileHover={{ scale: isMobile ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  navigate('/trip-planner');
                  showToast('🎯 Let\'s plan your adventure!', 'success');
                }}
                className="flex items-center justify-center gap-3 bg-white/20 backdrop-blur-sm p-4 rounded-xl hover:bg-white/30 transition-all"
            >
              <FaRoute />
              <div className="text-left">
                <div className="font-semibold">Plan Trip</div>
                <div className="text-sm opacity-90">Create your itinerary</div>
              </div>
            </motion.button>

            <motion.button
                whileHover={{ scale: isMobile ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  navigate('/blog');
                  showToast('📖 Enjoy reading!', 'success');
                }}
                className="flex items-center justify-center gap-3 bg-white/20 backdrop-blur-sm p-4 rounded-xl hover:bg-white/30 transition-all"
            >
              <FaNewspaper />
              <div className="text-left">
                <div className="font-semibold">Read Blog</div>
                <div className="text-sm opacity-90">Travel stories & tips</div>
              </div>
            </motion.button>
          </div>
        </div>
      </FadeInWrapper>
  );

  // Footer section
  const renderFooter = () => (
      <FadeInWrapper delay={0.6}>
        <div className="text-center py-8 border-t border-gray-200">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
          >
            <p className="text-gray-600 mb-4">
              "The mountains are calling and I must go." - John Muir
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <span>Made with</span>
              <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                  className="text-red-500"
              >
                ❤️
              </motion.span>
              <span>under starry skies</span>
            </div>
          </motion.div>
        </div>
      </FadeInWrapper>
  );

  return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden">
            <div className="p-4 md:p-6">

              {/* Hero Section */}
              {renderHeroSection()}

              {/* Stats Dashboard */}
              {renderStatsSection()}

              {/* Social & Contact */}
              {renderSocialSection()}

              {/* App Information */}
              {renderAppSection()}

              {/* Navigation Actions */}
              {renderNavigationSection()}

              {/* Footer */}
              {renderFooter()}

            </div>
          </div>
        </div>
      </div>
  );
};

export default About;