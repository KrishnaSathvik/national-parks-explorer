// ✨ Enhanced SkeletonLoader.jsx - Rich UI with Advanced Loading States
import React from "react";
import { motion } from "framer-motion";

const SkeletonLoader = ({ 
  type = "box", 
  count = 3, 
  className = "",
  animated = true,
  rounded = true,
  gradient = false 
}) => {
  
  // Enhanced skeleton styles with gradient shimmer effects
  const baseStyles = {
    box: "h-32 w-full rounded-xl mb-4",
    line: "h-4 w-full mb-2 rounded",
    card: "h-48 rounded-2xl",
    avatar: "h-12 w-12 rounded-full",
    button: "h-10 w-24 rounded-lg",
    text: "h-6 w-3/4 rounded",
    title: "h-8 w-1/2 rounded-lg mb-4",
    hero: "h-64 w-full rounded-2xl mb-6",
    stat: "h-24 w-full rounded-xl",
    weather: "h-40 w-full rounded-2xl",
    review: "h-32 w-full rounded-2xl mb-4",
    activity: "h-20 w-full rounded-xl mb-3",
    image: "aspect-video w-full rounded-xl",
    pill: "h-8 w-20 rounded-full",
    circle: "h-16 w-16 rounded-full",
    rectangle: "h-6 w-32 rounded",
    wide: "h-4 w-full rounded",
    narrow: "h-4 w-2/3 rounded",
    input: "h-12 w-full rounded-xl",
    textarea: "h-24 w-full rounded-xl"
  };

  // Animation variants for different loading states
  const shimmerVariants = {
    shimmer: {
      backgroundPosition: ["200% 0", "-200% 0"],
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "linear"
      }
    }
  };

  const pulseVariants = {
    pulse: {
      opacity: [0.4, 0.8, 0.4],
      transition: {
        repeat: Infinity,
        duration: 1.2,
        ease: "easeInOut"
      }
    }
  };

  const waveVariants = {
    wave: {
      scale: [1, 1.02, 1],
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: "easeInOut"
      }
    }
  };

  // Get the appropriate style for the skeleton type
  const selectedStyle = baseStyles[type] || baseStyles.box;
  
  // Determine animation class based on type and settings
  const getAnimationClass = () => {
    if (!animated) return "";
    
    if (gradient) {
      return "animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]";
    }
    
    return "animate-pulse bg-gray-200";
  };

  // Special skeleton components for complex layouts
  const SkeletonComponents = {
    // Enhanced card skeleton with multiple elements
    card: () => (
      <div className={`bg-white p-6 rounded-2xl shadow-lg border border-gray-100 ${className}`}>
        <div className="flex items-center space-x-4 mb-4">
          <div className={`h-12 w-12 rounded-full ${getAnimationClass()}`} />
          <div className="space-y-2 flex-1">
            <div className={`h-4 w-3/4 rounded ${getAnimationClass()}`} />
            <div className={`h-3 w-1/2 rounded ${getAnimationClass()}`} />
          </div>
        </div>
        <div className="space-y-3">
          <div className={`h-4 w-full rounded ${getAnimationClass()}`} />
          <div className={`h-4 w-5/6 rounded ${getAnimationClass()}`} />
          <div className={`h-4 w-2/3 rounded ${getAnimationClass()}`} />
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className={`h-8 w-20 rounded-full ${getAnimationClass()}`} />
          <div className={`h-8 w-24 rounded-lg ${getAnimationClass()}`} />
        </div>
      </div>
    ),

    // Weather card skeleton
    weather: () => (
      <div className={`bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/20 ${className}`}>
        <div className="text-center space-y-3">
          <div className={`h-4 w-20 mx-auto rounded ${getAnimationClass()}`} />
          <div className={`h-16 w-16 mx-auto rounded-full ${getAnimationClass()}`} />
          <div className={`h-3 w-24 mx-auto rounded ${getAnimationClass()}`} />
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className={`h-3 w-8 rounded ${getAnimationClass()}`} />
              <div className={`h-3 w-10 rounded ${getAnimationClass()}`} />
            </div>
            <div className="flex justify-between">
              <div className={`h-3 w-6 rounded ${getAnimationClass()}`} />
              <div className={`h-3 w-8 rounded ${getAnimationClass()}`} />
            </div>
          </div>
        </div>
      </div>
    ),

    // Review card skeleton
    review: () => (
      <div className={`bg-gradient-to-r from-white to-gray-50 p-4 rounded-2xl shadow-lg border border-gray-100 ${className}`}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full ${getAnimationClass()}`} />
            <div className="space-y-2">
              <div className={`h-4 w-24 rounded ${getAnimationClass()}`} />
              <div className={`h-3 w-16 rounded ${getAnimationClass()}`} />
            </div>
          </div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-4 w-4 rounded ${getAnimationClass()}`} />
            ))}
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className={`h-4 w-full rounded ${getAnimationClass()}`} />
          <div className={`h-4 w-5/6 rounded ${getAnimationClass()}`} />
          <div className={`h-4 w-3/4 rounded ${getAnimationClass()}`} />
        </div>
        <div className="flex justify-between items-center">
          <div className={`h-6 w-16 rounded-full ${getAnimationClass()}`} />
          <div className={`h-3 w-20 rounded ${getAnimationClass()}`} />
        </div>
      </div>
    ),

    // Hero section skeleton
    hero: () => (
      <div className={`relative bg-gradient-to-r from-gray-300 to-gray-400 p-8 rounded-2xl overflow-hidden ${className}`}>
        <div className={`absolute inset-0 ${getAnimationClass()}`} />
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-4 flex-1">
              <div className="h-8 w-2/3 bg-white/20 rounded-lg" />
              <div className="flex gap-3">
                <div className="h-6 w-20 bg-white/20 rounded-full" />
                <div className="h-6 w-24 bg-white/20 rounded-full" />
                <div className="h-6 w-16 bg-white/20 rounded-full" />
              </div>
              <div className="h-6 w-full bg-white/20 rounded" />
              <div className="h-6 w-4/5 bg-white/20 rounded" />
            </div>
            <div className="flex flex-col gap-3 ml-6">
              <div className="h-12 w-12 bg-white/20 rounded-full" />
              <div className="h-12 w-12 bg-white/20 rounded-full" />
              <div className="h-12 w-12 bg-white/20 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    ),

    // Stats grid skeleton
    stats: () => (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`p-4 rounded-2xl ${getAnimationClass()}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 rounded bg-white/20" />
              <div className="h-4 w-8 bg-white/20 rounded-full" />
            </div>
            <div className="h-6 w-12 bg-white/20 rounded mb-1" />
            <div className="h-4 w-16 bg-white/20 rounded" />
          </div>
        ))}
      </div>
    ),

    // Activity section skeleton
    activity: () => (
      <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 ${className}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded ${getAnimationClass()}`} />
            <div className="space-y-2">
              <div className={`h-5 w-32 rounded ${getAnimationClass()}`} />
              <div className={`h-3 w-24 rounded ${getAnimationClass()}`} />
            </div>
          </div>
          <div className={`h-6 w-6 rounded ${getAnimationClass()}`} />
        </div>
      </div>
    ),

    // Form skeleton
    form: () => (
      <div className={`bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/20 ${className}`}>
        <div className={`h-6 w-48 rounded mb-4 ${getAnimationClass()}`} />
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`h-12 w-full rounded-xl ${getAnimationClass()}`} />
            <div className="flex items-center gap-2">
              <div className={`h-4 w-16 rounded ${getAnimationClass()}`} />
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-6 w-6 rounded ${getAnimationClass()}`} />
                ))}
              </div>
            </div>
          </div>
          <div className={`h-32 w-full rounded-xl ${getAnimationClass()}`} />
          <div className={`h-12 w-32 rounded-xl ${getAnimationClass()}`} />
        </div>
      </div>
    ),

    // Navigation skeleton
    nav: () => (
      <div className={`flex items-center gap-2 text-sm mb-6 ${className}`}>
        <div className={`h-4 w-12 rounded ${getAnimationClass()}`} />
        <div className="h-3 w-3 rounded" />
        <div className={`h-4 w-16 rounded ${getAnimationClass()}`} />
        <div className="h-3 w-3 rounded" />
        <div className={`h-4 w-24 rounded ${getAnimationClass()}`} />
      </div>
    )
  };

  // If we have a special component for this type, use it
  if (SkeletonComponents[type]) {
    return (
      <div role="status" aria-busy="true" aria-label="Loading content">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            {SkeletonComponents[type]()}
          </motion.div>
        ))}
      </div>
    );
  }

  // Default skeleton component with enhanced animations
  return (
    <div role="status" aria-busy="true" aria-label="Loading content">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`${selectedStyle} ${getAnimationClass()} ${className}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: i * 0.1,
            duration: 0.3,
            ease: "easeOut"
          }}
          variants={animated ? (gradient ? shimmerVariants : pulseVariants) : {}}
          animate={animated ? (gradient ? "shimmer" : "pulse") : {}}
        />
      ))}
    </div>
  );
};

// Pre-configured skeleton components for common use cases
export const SkeletonCard = (props) => <SkeletonLoader type="card" count={1} {...props} />;
export const SkeletonWeather = (props) => <SkeletonLoader type="weather" count={5} {...props} />;
export const SkeletonReview = (props) => <SkeletonLoader type="review" count={3} {...props} />;
export const SkeletonHero = (props) => <SkeletonLoader type="hero" count={1} {...props} />;
export const SkeletonStats = (props) => <SkeletonLoader type="stats" count={1} {...props} />;
export const SkeletonActivity = (props) => <SkeletonLoader type="activity" count={3} {...props} />;
export const SkeletonForm = (props) => <SkeletonLoader type="form" count={1} {...props} />;
export const SkeletonNav = (props) => <SkeletonLoader type="nav" count={1} {...props} />;

export default SkeletonLoader;