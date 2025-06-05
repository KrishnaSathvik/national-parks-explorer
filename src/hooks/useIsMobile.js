// ✨ Enhanced useIsMobile.jsx - Advanced Device Detection System
import { useEffect, useState, useCallback, useMemo } from "react";

// Default breakpoints following common design system patterns
const DEFAULT_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
  ultrawide: 1920
};

// Device type detection patterns
const DEVICE_PATTERNS = {
  mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i,
  tablet: /iPad|Android(?!.*Mobile)/i,
  ios: /iPad|iPhone|iPod/i,
  android: /Android/i,
  safari: /^((?!chrome|android).)*safari/i,
  chrome: /Chrome/i,
  firefox: /Firefox/i,
  edge: /Edg/i
};

// Touch capability detection
const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
};

// Advanced device capabilities detection
const getDeviceCapabilities = () => {
  if (typeof window === 'undefined') {
    return {
      hasTouch: false,
      hasHover: false,
      hasPointer: false,
      prefersReducedMotion: false,
      supportsWebP: false,
      supportsAvif: false,
      hasCamera: false,
      hasGeolocation: false,
      hasNotifications: false
    };
  }

  const hasTouch = isTouchDevice();
  const hasHover = window.matchMedia('(hover: hover)').matches;
  const hasPointer = window.matchMedia('(pointer: fine)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Feature detection
  const hasCamera = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
  const hasGeolocation = 'geolocation' in navigator;
  const hasNotifications = 'Notification' in window;

  // Image format support detection
  const canvas = document.createElement('canvas');
  const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  
  let supportsAvif = false;
  try {
    supportsAvif = canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  } catch (e) {
    supportsAvif = false;
  }

  return {
    hasTouch,
    hasHover,
    hasPointer,
    prefersReducedMotion,
    supportsWebP,
    supportsAvif,
    hasCamera,
    hasGeolocation,
    hasNotifications
  };
};

// Network information detection
const getNetworkInfo = () => {
  if (typeof window === 'undefined' || !navigator.connection) {
    return {
      effectiveType: 'unknown',
      downlink: null,
      saveData: false
    };
  }

  const connection = navigator.connection;
  return {
    effectiveType: connection.effectiveType || 'unknown',
    downlink: connection.downlink || null,
    saveData: connection.saveData || false
  };
};

// Device orientation detection
const getOrientation = () => {
  if (typeof window === 'undefined') return 'unknown';
  
  const { innerWidth, innerHeight } = window;
  
  if (innerWidth > innerHeight) return 'landscape';
  if (innerHeight > innerWidth) return 'portrait';
  return 'square';
};

// Main useIsMobile hook with advanced features
const useIsMobile = (customBreakpoints = {}) => {
  const breakpoints = { ...DEFAULT_BREAKPOINTS, ...customBreakpoints };
  
  // Core state
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window === 'undefined') {
      return { width: 1024, height: 768 };
    }
    return { width: window.innerWidth, height: window.innerHeight };
  });

  const [deviceInfo, setDeviceInfo] = useState(() => ({
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    capabilities: getDeviceCapabilities(),
    network: getNetworkInfo(),
    orientation: getOrientation()
  }));

  // Debounced resize handler for better performance
  const handleResize = useCallback(() => {
    const newDimensions = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    setDimensions(newDimensions);
    setDeviceInfo(prev => ({
      ...prev,
      orientation: getOrientation()
    }));
  }, []);

  // Throttled resize handler
  const throttledResize = useMemo(() => {
    let timeoutId;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };
  }, [handleResize]);

  // Set up event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initial setup
    handleResize();

    // Resize listener
    window.addEventListener('resize', throttledResize);
    
    // Orientation change listener
    const handleOrientationChange = () => {
      // Small delay to ensure dimensions are updated
      setTimeout(() => {
        handleResize();
      }, 100);
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);

    // Network change listener
    const handleNetworkChange = () => {
      setDeviceInfo(prev => ({
        ...prev,
        network: getNetworkInfo()
      }));
    };

    if (navigator.connection) {
      navigator.connection.addEventListener('change', handleNetworkChange);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', throttledResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', handleNetworkChange);
      }
    };
  }, [throttledResize, handleResize]);

  // Computed device detection
  const deviceDetection = useMemo(() => {
    const { width } = dimensions;
    const { userAgent } = deviceInfo;

    // Screen size based detection
    const isMobile = width <= breakpoints.mobile;
    const isTablet = width > breakpoints.mobile && width <= breakpoints.tablet;
    const isDesktop = width > breakpoints.tablet && width <= breakpoints.desktop;
    const isUltrawide = width > breakpoints.desktop;

    // User agent based detection
    const isMobileDevice = DEVICE_PATTERNS.mobile.test(userAgent);
    const isTabletDevice = DEVICE_PATTERNS.tablet.test(userAgent);
    const isIOS = DEVICE_PATTERNS.ios.test(userAgent);
    const isAndroid = DEVICE_PATTERNS.android.test(userAgent);

    // Browser detection
    const isSafari = DEVICE_PATTERNS.safari.test(userAgent);
    const isChrome = DEVICE_PATTERNS.chrome.test(userAgent);
    const isFirefox = DEVICE_PATTERNS.firefox.test(userAgent);
    const isEdge = DEVICE_PATTERNS.edge.test(userAgent);

    // Smart detection combining screen size and user agent
    const isActualMobile = isMobile || (isMobileDevice && !isTabletDevice);
    const isActualTablet = isTablet || isTabletDevice;

    return {
      // Screen size categories
      isMobile,
      isTablet,
      isDesktop,
      isUltrawide,
      
      // Device type detection
      isMobileDevice,
      isTabletDevice,
      isIOS,
      isAndroid,
      
      // Browser detection
      isSafari,
      isChrome,
      isFirefox,
      isEdge,
      
      // Smart detection
      isActualMobile,
      isActualTablet,
      
      // Convenience flags
      isSmallScreen: width <= breakpoints.mobile,
      isMediumScreen: width > breakpoints.mobile && width <= breakpoints.tablet,
      isLargeScreen: width > breakpoints.tablet,
      isPortrait: deviceInfo.orientation === 'portrait',
      isLandscape: deviceInfo.orientation === 'landscape'
    };
  }, [dimensions, deviceInfo, breakpoints]);

  // Performance and capability info
  const performanceInfo = useMemo(() => {
    const { capabilities, network } = deviceInfo;
    const { width } = dimensions;
    
    // Determine if we should use performance optimizations
    const shouldOptimize = 
      width <= breakpoints.mobile || 
      network.saveData || 
      network.effectiveType === 'slow-2g' || 
      network.effectiveType === '2g' ||
      capabilities.prefersReducedMotion;

    const recommendedImageFormat = 
      capabilities.supportsAvif ? 'avif' :
      capabilities.supportsWebP ? 'webp' : 'jpg';

    return {
      shouldOptimize,
      recommendedImageFormat,
      shouldReduceAnimations: capabilities.prefersReducedMotion || shouldOptimize,
      shouldLazyLoad: true,
      maxImageQuality: shouldOptimize ? 'medium' : 'high'
    };
  }, [deviceInfo, dimensions, breakpoints]);

  // Return comprehensive device information
  return {
    // Core detection
    ...deviceDetection,
    
    // Dimensions
    width: dimensions.width,
    height: dimensions.height,
    orientation: deviceInfo.orientation,
    
    // Capabilities
    hasTouch: deviceInfo.capabilities.hasTouch,
    hasHover: deviceInfo.capabilities.hasHover,
    hasPointer: deviceInfo.capabilities.hasPointer,
    hasCamera: deviceInfo.capabilities.hasCamera,
    hasGeolocation: deviceInfo.capabilities.hasGeolocation,
    hasNotifications: deviceInfo.capabilities.hasNotifications,
    
    // Network
    networkType: deviceInfo.network.effectiveType,
    isSlowNetwork: ['slow-2g', '2g'].includes(deviceInfo.network.effectiveType),
    saveData: deviceInfo.network.saveData,
    
    // Performance recommendations
    ...performanceInfo,
    
    // Utility functions
    isBreakpoint: (breakpoint) => dimensions.width <= breakpoints[breakpoint],
    isAboveBreakpoint: (breakpoint) => dimensions.width > breakpoints[breakpoint],
    isBetweenBreakpoints: (min, max) => 
      dimensions.width > breakpoints[min] && dimensions.width <= breakpoints[max]
  };
};

// Specialized hooks for specific use cases
export const useScreenSize = (customBreakpoints = {}) => {
  const { width, height, isMobile, isTablet, isDesktop, isUltrawide } = useIsMobile(customBreakpoints);
  
  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isUltrawide,
    screenCategory: 
      isMobile ? 'mobile' :
      isTablet ? 'tablet' :
      isDesktop ? 'desktop' : 'ultrawide'
  };
};

export const useDeviceCapabilities = () => {
  const { 
    hasTouch, 
    hasHover, 
    hasPointer, 
    hasCamera, 
    hasGeolocation,
    hasNotifications,
    isIOS,
    isAndroid,
    isSafari,
    isChrome
  } = useIsMobile();

  return {
    hasTouch,
    hasHover,
    hasPointer,
    hasCamera,
    hasGeolocation,
    hasNotifications,
    isIOS,
    isAndroid,
    isSafari,
    isChrome
  };
};

export const usePerformanceOptimization = () => {
  const {
    shouldOptimize,
    shouldReduceAnimations,
    shouldLazyLoad,
    maxImageQuality,
    recommendedImageFormat,
    isSlowNetwork,
    saveData
  } = useIsMobile();

  return {
    shouldOptimize,
    shouldReduceAnimations,
    shouldLazyLoad,
    maxImageQuality,
    recommendedImageFormat,
    isSlowNetwork,
    saveData
  };
};

export const useOrientation = () => {
  const { orientation, isPortrait, isLandscape, width, height } = useIsMobile();
  
  return {
    orientation,
    isPortrait,
    isLandscape,
    aspectRatio: width / height
  };
};

// CSS-in-JS helper for responsive styles
export const useResponsiveStyles = () => {
  const { isMobile, isTablet, isDesktop } = useIsMobile();
  
  return useCallback((styles) => {
    if (isMobile && styles.mobile) return styles.mobile;
    if (isTablet && styles.tablet) return styles.tablet;
    if (isDesktop && styles.desktop) return styles.desktop;
    return styles.default || {};
  }, [isMobile, isTablet, isDesktop]);
};

// Hook for conditional rendering based on device
export const useConditionalRender = () => {
  const deviceInfo = useIsMobile();
  
  return {
    // Screen size conditionals
    Mobile: ({ children }) => deviceInfo.isMobile ? children : null,
    Tablet: ({ children }) => deviceInfo.isTablet ? children : null,
    Desktop: ({ children }) => deviceInfo.isDesktop ? children : null,
    
    // Capability conditionals
    TouchDevice: ({ children }) => deviceInfo.hasTouch ? children : null,
    HoverDevice: ({ children }) => deviceInfo.hasHover ? children : null,
    
    // Performance conditionals
    HighPerformance: ({ children }) => !deviceInfo.shouldOptimize ? children : null,
    LowPerformance: ({ children }) => deviceInfo.shouldOptimize ? children : null
  };
};

export default useIsMobile;