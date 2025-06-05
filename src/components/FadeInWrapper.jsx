// ✨ Enhanced FadeInWrapper.jsx - Advanced Animation System
import React, { forwardRef } from "react";
import { motion } from "framer-motion";

// Predefined animation presets for consistency
const animationPresets = {
  // Basic fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  
  // Slide animations
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  },
  
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  },
  
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },
  
  // Scale animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  },
  
  scaleOut: {
    initial: { opacity: 0, scale: 1.1 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 }
  },
  
  // Bounce animations
  bounceIn: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 100
      }
    },
    exit: { opacity: 0, scale: 0.3 }
  },
  
  // Rotation animations
  rotateIn: {
    initial: { opacity: 0, rotate: -10, scale: 0.9 },
    animate: { opacity: 1, rotate: 0, scale: 1 },
    exit: { opacity: 0, rotate: 10, scale: 0.9 }
  },
  
  // Complex animations for special use cases
  heroEntry: {
    initial: { opacity: 0, y: 40, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100
      }
    },
    exit: { opacity: 0, y: -40, scale: 0.95 }
  },
  
  cardEntry: {
    initial: { opacity: 0, y: 30, rotateX: 15 },
    animate: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 80
      }
    },
    exit: { opacity: 0, y: 30, rotateX: 15 }
  },
  
  floatIn: {
    initial: { opacity: 0, y: 50, scale: 0.8 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 60
      }
    },
    exit: { opacity: 0, y: 50, scale: 0.8 }
  },
  
  // Stagger-friendly animations
  staggerChild: {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 20, scale: 0.95 }
  },
  
  // Mobile-optimized animations (less motion)
  mobileSlide: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 }
  }
};

// Easing presets for different animation feels
const easingPresets = {
  smooth: "easeOut",
  snappy: "easeInOut", 
  bouncy: [0.25, 0.46, 0.45, 0.94],
  elastic: [0.68, -0.55, 0.265, 1.55],
  gentle: [0.25, 0.1, 0.25, 1],
  sharp: [0.4, 0, 0.2, 1]
};

// Viewport detection for reduced motion
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Check if device is mobile for performance optimization
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
};

const FadeInWrapper = forwardRef(({
  children,
  delay = 0,
  duration = 0.4,
  className = "",
  preset = "slideUp",
  easing = "smooth",
  once = true,
  threshold = 0.1,
  disabled = false,
  reduceMotion = true,
  stagger = false,
  staggerDelay = 0.1,
  whileHover,
  whileTap,
  whileInView,
  viewport = { once: true, margin: "0px 0px -100px 0px" },
  style = {},
  ...motionProps
}, ref) => {
  
  // Return children without animation if disabled or user prefers reduced motion
  if (disabled || (reduceMotion && prefersReducedMotion())) {
    return (
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    );
  }

  // Use mobile-optimized preset on mobile devices
  const effectivePreset = isMobile() && preset !== "mobileSlide" ? "mobileSlide" : preset;
  
  // Get animation variants from preset or use custom
  const variants = animationPresets[effectivePreset] || animationPresets.slideUp;
  
  // Build transition configuration
  const transition = {
    delay,
    duration,
    ease: easingPresets[easing] || easing,
    ...variants.transition
  };

  // Stagger configuration for child animations
  const staggerTransition = stagger ? {
    staggerChildren: staggerDelay,
    delayChildren: delay
  } : {};

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={{ ...transition, ...staggerTransition }}
      viewport={viewport}
      whileHover={whileHover}
      whileTap={whileTap}
      whileInView={whileInView}
      {...motionProps}
    >
      {stagger ? (
        // Wrap children for stagger effect
        React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            variants={animationPresets.staggerChild}
            transition={{ duration: duration * 0.8, ease: easingPresets[easing] }}
          >
            {child}
          </motion.div>
        ))
      ) : (
        children
      )}
    </motion.div>
  );
});

FadeInWrapper.displayName = "FadeInWrapper";

// Specialized wrapper components for common use cases
export const HeroFadeIn = ({ children, ...props }) => (
  <FadeInWrapper preset="heroEntry" duration={0.8} easing="bouncy" {...props}>
    {children}
  </FadeInWrapper>
);

export const CardFadeIn = ({ children, index = 0, ...props }) => (
  <FadeInWrapper 
    preset="cardEntry" 
    delay={index * 0.1} 
    duration={0.6} 
    easing="smooth" 
    {...props}
  >
    {children}
  </FadeInWrapper>
);

export const StaggerGroup = ({ children, staggerDelay = 0.1, ...props }) => (
  <FadeInWrapper stagger staggerDelay={staggerDelay} {...props}>
    {children}
  </FadeInWrapper>
);

export const FloatIn = ({ children, ...props }) => (
  <FadeInWrapper preset="floatIn" duration={0.8} easing="elastic" {...props}>
    {children}
  </FadeInWrapper>
);

export const QuickFade = ({ children, ...props }) => (
  <FadeInWrapper preset="fadeIn" duration={0.2} easing="sharp" {...props}>
    {children}
  </FadeInWrapper>
);

// Hook for creating consistent animation sequences
export const useAnimationSequence = (items, baseDelay = 0, increment = 0.1) => {
  return items.map((_, index) => ({
    delay: baseDelay + (index * increment),
    key: index
  }));
};

// Utility for viewport-triggered animations
export const ViewportFadeIn = ({ children, triggerOnce = true, ...props }) => (
  <FadeInWrapper
    whileInView={animationPresets.slideUp.animate}
    viewport={{ once: triggerOnce, threshold: 0.1 }}
    {...props}
  >
    {children}
  </FadeInWrapper>
);

// Performance-optimized wrapper for lists
export const ListItemFadeIn = ({ children, index, total, ...props }) => {
  // Limit delay for long lists to prevent excessive wait times
  const maxDelay = Math.min(index * 0.05, 1);
  
  return (
    <FadeInWrapper
      preset="staggerChild"
      delay={maxDelay}
      duration={0.3}
      {...props}
    >
      {children}
    </FadeInWrapper>
  );
};

// Export animation presets for external use
export { animationPresets, easingPresets };

export default FadeInWrapper;