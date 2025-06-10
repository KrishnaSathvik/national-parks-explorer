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
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [activeTimelineIndex, setActiveTimelineIndex] = useState(0);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

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

  const featuredPhotos = [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1543059509-c9e94c51f17d?w=800",
      title: "Milky Way over Death Valley",
      location: "Death Valley National Park, California",
      camera: "Nikon Z6ii",
      settings: "14mm, f/2.8, 25s, ISO 3200",
      story: "My first serious astrophotography expedition in 2023. Death Valley's dark skies provided the perfect canvas for capturing the Milky Way core.",
      year: "2023"
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1508739826987-b79cd8b7da7b?w=800",
      title: "Grand Canyon Astro Photography",
      location: "Grand Canyon National Park, Arizona",
      camera: "Nikon Z6ii",
      settings: "20mm, f/2.8, 30s, ISO 1600",
      story: "Captured during my 2024 Grand Canyon astrophotography session. The canyon's depth creates incredible foreground drama against the starry sky.",
      year: "2024"
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800",
      title: "Yellowstone Night Sky",
      location: "Yellowstone National Park, Wyoming",
      camera: "Nikon Z6ii",
      settings: "24mm, f/2.8, 20s, ISO 2500",
      story: "Yellowstone's geothermal features create unique compositions for night photography. This shot combines the natural beauty with the cosmic wonder above.",
      year: "2024"
    }
  ];

  const timeline = [
    {
      year: "2020",
      title: "First National Park Visit",
      description: "Grand Canyon captured my heart and started my love affair with national parks",
      icon: "🏞️",
      color: "from-green-500 to-emerald-500"
    },
    {
      year: "2022",
      title: "Google Maps Contributor",
      description: "Started sharing detailed reviews and photos to help fellow travelers",
      icon: "🗺️",
      color: "from-blue-500 to-cyan-500"
    },
    {
      year: "2023",
      title: "Photography Journey Begins",
      description: "Got Nikon Z6ii and dove into astrophotography with Death Valley expedition",
      icon: "📸",
      color: "from-purple-500 to-pink-500"
    },
    {
      year: "2024",
      title: "Google Maps Level 8",
      description: "Reached Level 8 contributor status with detailed park reviews and photos",
      icon: "🏆",
      color: "from-yellow-500 to-orange-500"
    },
    {
      year: "2024",
      title: "Yellowstone & Grand Canyon",
      description: "Epic astrophotography expeditions capturing Milky Way over iconic landscapes",
      icon: "🌌",
      color: "from-indigo-500 to-purple-500"
    },
    {
      year: "2025",
      title: "Big Bend & This App",
      description: "Latest adventure to Big Bend NP and created this platform to help fellow explorers",
      icon: "🚀",
      color: "from-pink-500 to-rose-500"
    }
  ];

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
      url: "mailto:hello@krishna.dev",
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

  // Auto-rotate testimonials removed
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
  //   }, 4000);
  //   return () => clearInterval(interval);
  // }, [testimonials.length]);

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

  // Featured Photography
  const renderPhotographySection = () => (
      <FadeInWrapper delay={0.3}>
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`font-bold text-gray-800 flex items-center gap-3 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                📸 Featured Photography
              </h3>
              <p className="text-gray-600 text-sm">My favorite captures from national parks</p>
            </div>
            <a
                href="https://unsplash.com/@astrobykrishna"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-lg hover:from-gray-700 hover:to-gray-900 transition text-sm"
            >
              <FaEye /> View All
            </a>
          </div>

          {/* Photo Gallery */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            {featuredPhotos.map((photo, index) => (
                <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
                    onClick={() => {
                      setSelectedPhotoIndex(index);
                      setShowLightbox(true);
                    }}
                >
                  <div className="aspect-w-16 aspect-h-12 bg-gradient-to-br from-gray-200 to-gray-300">
                    <img
                        src={photo.url}
                        alt={photo.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 text-white">
                      <h4 className="font-semibold text-sm mb-1">{photo.title}</h4>
                      <p className="text-xs opacity-90">{photo.location}</p>
                    </div>
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2">
                      <FaCamera className="text-white text-sm" />
                    </div>
                  </div>
                </motion.div>
            ))}
          </div>

          {/* Photo Lightbox */}
          <AnimatePresence>
            {showLightbox && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowLightbox(false)}
                >
                  <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="max-w-4xl w-full bg-white rounded-2xl overflow-hidden"
                      onClick={e => e.stopPropagation()}
                  >
                    <div className="relative">
                      <img
                          src={featuredPhotos[selectedPhotoIndex].url}
                          alt={featuredPhotos[selectedPhotoIndex].title}
                          className="w-full h-96 object-cover"
                      />
                      <button
                          onClick={() => setShowLightbox(false)}
                          className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {featuredPhotos[selectedPhotoIndex].title}
                      </h3>
                      <p className="text-gray-600 mb-4">{featuredPhotos[selectedPhotoIndex].story}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span><strong>Location:</strong> {featuredPhotos[selectedPhotoIndex].location}</span>
                        <span><strong>Camera:</strong> {featuredPhotos[selectedPhotoIndex].camera}</span>
                        <span><strong>Settings:</strong> {featuredPhotos[selectedPhotoIndex].settings}</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </FadeInWrapper>
  );

  // Journey Timeline
  const renderTimelineSection = () => (
      <FadeInWrapper delay={0.4}>
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="mb-6">
            <h3 className={`font-bold text-gray-800 flex items-center gap-3 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              🛣️ My Journey
            </h3>
            <p className="text-gray-600 text-sm">From first park visit to building this app</p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-500 to-purple-500"></div>

            {timeline.map((item, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative flex items-start gap-6 pb-8 ${index === timeline.length - 1 ? 'pb-0' : ''}`}
                >
                  {/* Timeline dot */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${item.color} flex items-center justify-center text-white text-xl shadow-lg z-10`}>
                    {item.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-bold text-gray-500">{item.year}</span>
                      <div className="flex-1 h-px bg-gray-200"></div>
                    </div>
                    <h4 className="font-bold text-gray-800 mb-2">{item.title}</h4>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </motion.div>
            ))}
          </div>
        </div>
      </FadeInWrapper>
  );

  // Social Links & Contact
  const renderSocialSection = () => (
      <FadeInWrapper delay={0.5}>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 mb-8">
          {/* Social Links */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h3 className={`font-bold text-gray-800 mb-6 ${isMobile ? 'text-lg' : 'text-xl'}`}>
              🌐 Connect With Me
            </h3>
            <div className="space-y-3">
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
                        {link.label === 'Email' && 'hello@krishna.dev'}
                      </div>
                    </div>
                  </motion.a>
              ))}
            </div>
          </div>

          {/* Photography Journey */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h3 className={`font-bold text-gray-800 mb-6 ${isMobile ? 'text-lg' : 'text-xl'}`}>
              📷 Photography Journey
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl">
                  📷
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Camera Setup</div>
                  <div className="text-sm text-gray-600">Nikon Z6ii with fast wide-angle lenses</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-xl">
                  🌌
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Specialty</div>
                  <div className="text-sm text-gray-600">Astrophotography & National Park landscapes</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white text-xl">
                  🎯
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Mission</div>
                  <div className="text-sm text-gray-600">Inspiring others to explore dark sky destinations</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeInWrapper>
  );

  // App Information
  const renderAppSection = () => (
      <FadeInWrapper delay={0.6}>
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
      <FadeInWrapper delay={0.7}>
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

  // Fun Facts Section removed
  const renderFunFactsSection = () => null;

  // Footer section
  const renderFooter = () => (
      <FadeInWrapper delay={0.9}>
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

              {/* Featured Photography */}
              {renderPhotographySection()}

              {/* Journey Timeline */}
              {renderTimelineSection()}

              {/* Social & Photography Journey */}
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