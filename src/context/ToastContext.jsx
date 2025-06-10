// ✨ FIXED ToastContext.jsx - Safe useToast Hook
import React, { createContext, useContext, useCallback, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
  FaExclamationCircle,
  FaHeart,
  FaStar,
  FaMapMarkerAlt,
  FaRoute,
  FaClock,
  FaWifi,
  FaBell,
  FaCamera,
  FaShare
} from "react-icons/fa";
import { MdWifiOff } from "react-icons/md";

const ToastContext = createContext(null);

/**
 * ✅ FIXED: Safe hook to access the enhanced toast context
 */
export const useToast = () => {
  const context = useContext(ToastContext);

  // ✅ FIX: Return safe fallback instead of throwing error
  if (!context) {
    console.warn('useToast called outside ToastProvider - using fallback methods');
    return {
      showToast: (message, type = 'info', options = {}) => {
        console.log(`[Toast ${type.toUpperCase()}]: ${message}`, options);
      },
      removeToast: () => {},
      clearAllToasts: () => {},
      showSuccessToast: (message, options) => console.log(`[SUCCESS]: ${message}`, options),
      showErrorToast: (message, options) => console.log(`[ERROR]: ${message}`, options),
      showWarningToast: (message, options) => console.log(`[WARNING]: ${message}`, options),
      showInfoToast: (message, options) => console.log(`[INFO]: ${message}`, options),
      showFavoriteToast: (message, options) => console.log(`[FAVORITE]: ${message}`, options),
      showTripToast: (message, options) => console.log(`[TRIP]: ${message}`, options),
      showReviewToast: (message, options) => console.log(`[REVIEW]: ${message}`, options),
      showLocationToast: (message, options) => console.log(`[LOCATION]: ${message}`, options),
      showOfflineToast: () => console.log('[OFFLINE]: You are offline'),
      showOnlineToast: () => console.log('[ONLINE]: Back online'),
      toasts: [],
      toastCount: 0
    };
  }

  return context;
};

// Enhanced toast type configurations
const toastConfig = {
  success: {
    icon: FaCheckCircle,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50 border-green-200",
    textColor: "text-green-800",
    iconColor: "text-green-500",
    duration: 4000
  },
  error: {
    icon: FaExclamationCircle,
    color: "from-red-500 to-rose-500",
    bgColor: "bg-red-50 border-red-200",
    textColor: "text-red-800",
    iconColor: "text-red-500",
    duration: 6000
  },
  warning: {
    icon: FaExclamationTriangle,
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-50 border-yellow-200",
    textColor: "text-yellow-800",
    iconColor: "text-yellow-500",
    duration: 5000
  },
  info: {
    icon: FaInfoCircle,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 border-blue-200",
    textColor: "text-blue-800",
    iconColor: "text-blue-500",
    duration: 4000
  },
  // Specialized toast types for your app
  favorite: {
    icon: FaHeart,
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-50 border-pink-200",
    textColor: "text-pink-800",
    iconColor: "text-pink-500",
    duration: 3000
  },
  trip: {
    icon: FaRoute,
    color: "from-purple-500 to-indigo-500",
    bgColor: "bg-purple-50 border-purple-200",
    textColor: "text-purple-800",
    iconColor: "text-purple-500",
    duration: 4000
  },
  review: {
    icon: FaStar,
    color: "from-yellow-500 to-amber-500",
    bgColor: "bg-yellow-50 border-yellow-200",
    textColor: "text-yellow-800",
    iconColor: "text-yellow-500",
    duration: 3000
  },
  location: {
    icon: FaMapMarkerAlt,
    color: "from-teal-500 to-cyan-500",
    bgColor: "bg-teal-50 border-teal-200",
    textColor: "text-teal-800",
    iconColor: "text-teal-500",
    duration: 4000
  },
  offline: {
    icon: MdWifiOff,
    color: "from-gray-500 to-slate-500",
    bgColor: "bg-gray-50 border-gray-200",
    textColor: "text-gray-800",
    iconColor: "text-gray-500",
    duration: 0, // Persistent until online
    persistent: true
  },
  online: {
    icon: FaWifi,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50 border-green-200",
    textColor: "text-green-800",
    iconColor: "text-green-500",
    duration: 2000
  },
  notification: {
    icon: FaBell,
    color: "from-indigo-500 to-purple-500",
    bgColor: "bg-indigo-50 border-indigo-200",
    textColor: "text-indigo-800",
    iconColor: "text-indigo-500",
    duration: 5000
  },
  photo: {
    icon: FaCamera,
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-50 border-violet-200",
    textColor: "text-violet-800",
    iconColor: "text-violet-500",
    duration: 3000
  },
  share: {
    icon: FaShare,
    color: "from-sky-500 to-blue-500",
    bgColor: "bg-sky-50 border-sky-200",
    textColor: "text-sky-800",
    iconColor: "text-sky-500",
    duration: 3000
  }
};

// Toast positions
const positions = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
};

// Animation variants
const toastVariants = {
  initial: (position) => {
    if (position.includes('right')) return { x: 300, opacity: 0, scale: 0.8 };
    if (position.includes('left')) return { x: -300, opacity: 0, scale: 0.8 };
    if (position.includes('top')) return { y: -100, opacity: 0, scale: 0.8 };
    if (position.includes('bottom')) return { y: 100, opacity: 0, scale: 0.8 };
    return { opacity: 0, scale: 0.8 };
  },
  animate: {
    x: 0,
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300,
      duration: 0.4
    }
  },
  exit: (position) => {
    if (position.includes('right')) return { x: 300, opacity: 0, scale: 0.8 };
    if (position.includes('left')) return { x: -300, opacity: 0, scale: 0.8 };
    if (position.includes('top')) return { y: -100, opacity: 0, scale: 0.8 };
    if (position.includes('bottom')) return { y: 100, opacity: 0, scale: 0.8 };
    return { opacity: 0, scale: 0.8 };
  }
};

// Enhanced Toast Component
const Toast = ({
                 id,
                 message,
                 type = "info",
                 duration,
                 onClose,
                 position = "top-right",
                 showProgress = true,
                 persistent = false,
                 action,
                 actionLabel,
                 onActionClick,
                 title,
                 subtitle,
                 customIcon,
                 className = ""
               }) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  const config = toastConfig[type] || toastConfig.info;
  const Icon = customIcon || config.icon;
  const toastDuration = duration || config.duration;

  // Progress bar animation
  useEffect(() => {
    if (persistent || toastDuration === 0 || isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const decrement = 100 / (toastDuration / 50);
        const newProgress = prev - decrement;

        if (newProgress <= 0) {
          onClose(id);
          return 0;
        }

        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [id, toastDuration, onClose, persistent, isPaused]);

  const handleActionClick = () => {
    if (onActionClick) {
      onActionClick();
    }
    onClose(id);
  };

  return (
      <motion.div
          layout
          variants={toastVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          custom={position}
          className={`
        relative max-w-sm w-full pointer-events-auto overflow-hidden rounded-2xl shadow-lg border-2
        ${config.bgColor} backdrop-blur-sm bg-opacity-90
        ${className}
      `}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
      >
        {/* Progress bar */}
        {showProgress && !persistent && toastDuration > 0 && (
            <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full">
              <motion.div
                  className={`h-full bg-gradient-to-r ${config.color}`}
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>
        )}

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`flex-shrink-0 ${config.iconColor}`}>
              <Icon className="text-xl" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {title && (
                  <h4 className={`font-semibold ${config.textColor} mb-1`}>
                    {title}
                  </h4>
              )}

              <p className={`${config.textColor} text-sm leading-relaxed`}>
                {message}
              </p>

              {subtitle && (
                  <p className={`${config.textColor} text-xs opacity-75 mt-1`}>
                    {subtitle}
                  </p>
              )}

              {/* Action button */}
              {action && actionLabel && (
                  <button
                      onClick={handleActionClick}
                      className={`
                  mt-3 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200
                  bg-gradient-to-r ${config.color} text-white hover:shadow-md transform hover:scale-105
                `}
                  >
                    {actionLabel}
                  </button>
              )}
            </div>

            {/* Close button */}
            <button
                onClick={() => onClose(id)}
                className={`
              flex-shrink-0 p-1 rounded-full transition-colors duration-200
              ${config.textColor} hover:bg-black hover:bg-opacity-10
            `}
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
        </div>
      </motion.div>
  );
};

/**
 * Enhanced ToastProvider with advanced features
 */
export const ToastProvider = ({
                                children,
                                position = "top-right",
                                maxToasts = 5,
                                enableSounds = false,
                                enableReducedMotion = true
                              }) => {
  const [toasts, setToasts] = useState([]);
  const [toastCounter, setToastCounter] = useState(0);

  // Remove toast by ID
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Clear all toasts
  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Enhanced showToast function
  const showToast = useCallback((message, type = "info", options = {}) => {
    const id = `toast-${toastCounter}`;
    setToastCounter(prev => prev + 1);

    const config = toastConfig[type] || toastConfig.info;

    const newToast = {
      id,
      message,
      type,
      duration: options.duration ?? config.duration,
      persistent: options.persistent ?? config.persistent ?? false,
      title: options.title,
      subtitle: options.subtitle,
      customIcon: options.icon,
      action: options.action,
      actionLabel: options.actionLabel,
      onActionClick: options.onActionClick,
      className: options.className || "",
      timestamp: Date.now()
    };

    setToasts(prev => {
      // Remove oldest toast if we're at max capacity
      const updatedToasts = prev.length >= maxToasts ? prev.slice(1) : prev;

      // Check for duplicate messages (prevent spam)
      const isDuplicate = updatedToasts.some(toast =>
          toast.message === message &&
          toast.type === type &&
          (Date.now() - toast.timestamp) < 1000
      );

      if (isDuplicate) return updatedToasts;

      return [...updatedToasts, newToast];
    });

    return id;
  }, [toastCounter, maxToasts]);

  // Specialized toast methods
  const showSuccessToast = useCallback((message, options) =>
      showToast(message, "success", options), [showToast]);

  const showErrorToast = useCallback((message, options) =>
      showToast(message, "error", options), [showToast]);

  const showWarningToast = useCallback((message, options) =>
      showToast(message, "warning", options), [showToast]);

  const showInfoToast = useCallback((message, options) =>
      showToast(message, "info", options), [showToast]);

  // Specialized app-specific toast methods
  const showFavoriteToast = useCallback((message, options) =>
      showToast(message, "favorite", options), [showToast]);

  const showTripToast = useCallback((message, options) =>
      showToast(message, "trip", options), [showToast]);

  const showReviewToast = useCallback((message, options) =>
      showToast(message, "review", options), [showToast]);

  const showLocationToast = useCallback((message, options) =>
      showToast(message, "location", options), [showToast]);

  const showOfflineToast = useCallback(() =>
      showToast("You're offline. Some features may be limited.", "offline", { persistent: true }), [showToast]);

  const showOnlineToast = useCallback(() =>
      showToast("Back online! All features restored.", "online"), [showToast]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      // Remove offline toasts
      setToasts(prev => prev.filter(toast => toast.type !== 'offline'));
      showOnlineToast();
    };

    const handleOffline = () => {
      showOfflineToast();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showOnlineToast, showOfflineToast]);

  // Context value
  const contextValue = {
    // Core methods
    showToast,
    removeToast,
    clearAllToasts,

    // Convenience methods
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,

    // Specialized methods
    showFavoriteToast,
    showTripToast,
    showReviewToast,
    showLocationToast,
    showOfflineToast,
    showOnlineToast,

    // State
    toasts,
    toastCount: toasts.length
  };

  return (
      <ToastContext.Provider value={contextValue}>
        {children}

        {/* Toast Container */}
        <div
            className={`fixed z-50 pointer-events-none ${positions[position]}`}
            style={{ maxWidth: 'calc(100vw - 2rem)' }}
        >
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {toasts.map((toast) => (
                  <Toast
                      key={toast.id}
                      {...toast}
                      position={position}
                      onClose={removeToast}
                  />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </ToastContext.Provider>
  );
};

// Utility hooks
export const useToastActions = () => {
  const {
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
    clearAllToasts
  } = useToast();

  return {
    success: showSuccessToast,
    error: showErrorToast,
    warning: showWarningToast,
    info: showInfoToast,
    clear: clearAllToasts
  };
};

export const useAppToasts = () => {
  const {
    showFavoriteToast,
    showTripToast,
    showReviewToast,
    showLocationToast
  } = useToast();

  return {
    favorite: showFavoriteToast,
    trip: showTripToast,
    review: showReviewToast,
    location: showLocationToast
  };
};

export default ToastContext;