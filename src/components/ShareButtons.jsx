// ✨ Enhanced ShareButtons.jsx - Rich UI with Advanced Features
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaEnvelope,
  FaWhatsapp,
  FaInstagram,
  FaLink,
  FaShare,
  FaTimes,
  FaCopy,
  FaCheckCircle,
} from "react-icons/fa";

const ShareButtons = ({ title, description, imageUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const url = window.location.href;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title || "Amazing National Park");
  const encodedDescription = encodeURIComponent(description || "Check out this amazing national park!");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOptions = [
    {
      name: "Copy Link",
      icon: copied ? FaCheckCircle : FaCopy,
      color: copied ? "from-green-500 to-emerald-500" : "from-gray-500 to-gray-600",
      textColor: copied ? "text-green-600" : "text-gray-600",
      bgColor: copied ? "bg-green-100 hover:bg-green-200" : "bg-gray-100 hover:bg-gray-200",
      action: handleCopy,
      type: "button"
    },
    {
      name: "Facebook",
      icon: FaFacebookF,
      color: "from-blue-600 to-blue-700",
      textColor: "text-blue-600",
      bgColor: "bg-blue-100 hover:bg-blue-200",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
      type: "link"
    },
    {
      name: "Twitter",
      icon: FaTwitter,
      color: "from-sky-500 to-sky-600",
      textColor: "text-sky-600",
      bgColor: "bg-sky-100 hover:bg-sky-200",
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=NationalParks,Travel,Adventure`,
      type: "link"
    },
    {
      name: "LinkedIn",
      icon: FaLinkedinIn,
      color: "from-blue-700 to-blue-800",
      textColor: "text-blue-700",
      bgColor: "bg-blue-100 hover:bg-blue-200",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      type: "link"
    },
    {
      name: "WhatsApp",
      icon: FaWhatsapp,
      color: "from-green-500 to-green-600",
      textColor: "text-green-600",
      bgColor: "bg-green-100 hover:bg-green-200",
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      type: "link"
    },
    {
      name: "Email",
      icon: FaEnvelope,
      color: "from-orange-500 to-orange-600",
      textColor: "text-orange-600",
      bgColor: "bg-orange-100 hover:bg-orange-200",
      url: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      type: "link"
    },
    {
      name: "Instagram",
      icon: FaInstagram,
      color: "from-pink-500 to-purple-600",
      textColor: "text-pink-600",
      bgColor: "bg-pink-100 hover:bg-pink-200",
      url: "https://www.instagram.com/",
      type: "link"
    }
  ];

  // Check if Web Share API is available
  const canUseWebShare = navigator.share && navigator.canShare && navigator.canShare({
    title: title,
    url: url
  });

  const handleWebShare = async () => {
    if (canUseWebShare) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: url,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          setIsOpen(true); // Fallback to custom share menu
        }
      }
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* Main Share Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleWebShare}
        className="group relative p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200 border border-white/30"
        title="Share this park"
      >
        <FaShare className="text-xl group-hover:scale-110 transition-transform" />
      </motion.button>

      {/* Custom Share Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Share Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 bg-white rounded-3xl shadow-2xl z-50 max-w-md w-full"
            >
              {/* Header */}
              <div className="relative p-6 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Share this park</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Spread the adventure with friends!
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <FaTimes className="text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Share Options Grid */}
              <div className="px-6 pb-6">
                <div className="grid grid-cols-2 gap-3">
                  {shareOptions.map((option, index) => (
                    <motion.div
                      key={option.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {option.type === "button" ? (
                        <button
                          onClick={option.action}
                          className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 ${option.bgColor} group hover:shadow-md transform hover:scale-105`}
                        >
                          <div className={`p-2 rounded-full bg-gradient-to-r ${option.color} text-white group-hover:scale-110 transition-transform`}>
                            <option.icon className="text-sm" />
                          </div>
                          <span className={`font-semibold ${option.textColor} group-hover:scale-105 transition-transform`}>
                            {option.name}
                          </span>
                        </button>
                      ) : (
                        <a
                          href={option.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 ${option.bgColor} group hover:shadow-md transform hover:scale-105`}
                          onClick={() => setIsOpen(false)}
                        >
                          <div className={`p-2 rounded-full bg-gradient-to-r ${option.color} text-white group-hover:scale-110 transition-transform`}>
                            <option.icon className="text-sm" />
                          </div>
                          <span className={`font-semibold ${option.textColor} group-hover:scale-105 transition-transform`}>
                            {option.name}
                          </span>
                        </a>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* URL Display */}
                <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-3">
                      <p className="text-xs text-gray-500 font-medium mb-1">Page URL:</p>
                      <p className="text-sm text-gray-700 truncate font-mono bg-white px-3 py-2 rounded-lg">
                        {url}
                      </p>
                    </div>
                    <button
                      onClick={handleCopy}
                      className={`p-3 rounded-xl transition-all duration-200 ${
                        copied 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      }`}
                      title={copied ? "Copied!" : "Copy URL"}
                    >
                      {copied ? <FaCheckCircle /> : <FaCopy />}
                    </button>
                  </div>
                </div>

                {/* Copy Confirmation */}
                <AnimatePresence>
                  {copied && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-3 text-center"
                    >
                      <span className="inline-flex items-center gap-2 text-green-600 font-medium text-sm bg-green-100 px-4 py-2 rounded-full">
                        <FaCheckCircle />
                        Link copied to clipboard!
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ShareButtons;