// ✨ Enhanced Accordion.jsx - Advanced UI with Rich Features
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaChevronDown, 
  FaChevronUp, 
  FaChevronRight,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaLightbulb,
  FaStar,
  FaHeart,
  FaMapMarkerAlt,
  FaUtensils,
  FaBed,
  FaCamera,
  FaHiking
} from "react-icons/fa";

// Icon mapping for different accordion types
const iconMap = {
  info: FaInfoCircle,
  warning: FaExclamationTriangle,
  success: FaCheckCircle,
  tip: FaLightbulb,
  featured: FaStar,
  favorite: FaHeart,
  location: FaMapMarkerAlt,
  food: FaUtensils,
  accommodation: FaBed,
  photography: FaCamera,
  activity: FaHiking,
  default: FaInfoCircle
};

// Color themes for different accordion variants
const colorThemes = {
  default: {
    header: "bg-gray-50 hover:bg-gray-100 border-gray-200",
    headerText: "text-gray-800",
    content: "bg-white border-gray-200",
    icon: "text-gray-500",
    accent: "focus:ring-pink-400 focus:border-pink-400"
  },
  primary: {
    header: "bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-blue-200",
    headerText: "text-blue-800",
    content: "bg-white border-blue-200",
    icon: "text-blue-500",
    accent: "focus:ring-blue-400 focus:border-blue-400"
  },
  success: {
    header: "bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200",
    headerText: "text-green-800",
    content: "bg-white border-green-200",
    icon: "text-green-500",
    accent: "focus:ring-green-400 focus:border-green-400"
  },
  warning: {
    header: "bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 border-yellow-200",
    headerText: "text-yellow-800",
    content: "bg-white border-yellow-200",
    icon: "text-yellow-500",
    accent: "focus:ring-yellow-400 focus:border-yellow-400"
  },
  danger: {
    header: "bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 border-red-200",
    headerText: "text-red-800",
    content: "bg-white border-red-200",
    icon: "text-red-500",
    accent: "focus:ring-red-400 focus:border-red-400"
  },
  purple: {
    header: "bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-200",
    headerText: "text-purple-800",
    content: "bg-white border-purple-200",
    icon: "text-purple-500",
    accent: "focus:ring-purple-400 focus:border-purple-400"
  }
};

const Accordion = ({ 
  title, 
  children, 
  defaultOpen = false,
  variant = "default",
  icon,
  iconType = "default",
  subtitle,
  badge,
  onToggle,
  disabled = false,
  animated = true,
  collapsible = true,
  className = "",
  headerClassName = "",
  contentClassName = "",
  size = "medium",
  rounded = true,
  shadow = true,
  glassMorphism = false,
  id
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef(null);
  const accordionId = id || `accordion-${Math.random().toString(36).substr(2, 9)}`;

  // Calculate content height for smooth animations
  useEffect(() => {
    if (contentRef.current && isOpen) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen, children]);

  // Handle accordion toggle
  const toggleAccordion = () => {
    if (disabled || !collapsible) return;
    
    const newState = !isOpen;
    setIsOpen(newState);
    
    if (onToggle) {
      onToggle(newState);
    }
  };

  // Get theme colors
  const theme = colorThemes[variant] || colorThemes.default;
  
  // Get icon component
  const IconComponent = icon || iconMap[iconType] || iconMap.default;
  
  // Size classes
  const sizeClasses = {
    small: {
      header: "px-4 py-3 text-sm",
      content: "px-4 py-3 text-sm",
      icon: "text-sm",
      chevron: "text-xs"
    },
    medium: {
      header: "px-5 py-4 text-base",
      content: "px-5 py-4 text-sm",
      icon: "text-base",
      chevron: "text-sm"
    },
    large: {
      header: "px-6 py-5 text-lg",
      content: "px-6 py-5 text-base",
      icon: "text-lg",
      chevron: "text-base"
    }
  };

  const sizeClass = sizeClasses[size] || sizeClasses.medium;

  // Animation variants
  const contentVariants = {
    closed: {
      height: 0,
      opacity: 0,
      transition: {
        height: { duration: 0.3, ease: "easeInOut" },
        opacity: { duration: 0.2, ease: "easeInOut" }
      }
    },
    open: {
      height: "auto",
      opacity: 1,
      transition: {
        height: { duration: 0.3, ease: "easeInOut" },
        opacity: { duration: 0.2, delay: 0.1, ease: "easeInOut" }
      }
    }
  };

  const chevronVariants = {
    closed: { rotate: 0 },
    open: { rotate: 180 }
  };

  // Build CSS classes
  const containerClasses = [
    "accordion-container",
    rounded ? "rounded-2xl" : "rounded-none",
    shadow ? "shadow-lg" : "",
    glassMorphism ? "backdrop-blur-lg bg-white/80" : "bg-white",
    "border transition-all duration-200",
    theme.content.split(' ')[2], // border color
    className
  ].filter(Boolean).join(' ');

  const headerClasses = [
    "accordion-header",
    "flex justify-between items-center w-full text-left transition-all duration-200",
    rounded ? (isOpen ? "rounded-t-2xl" : "rounded-2xl") : "rounded-none",
    sizeClass.header,
    theme.header,
    theme.headerText,
    theme.accent,
    disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
    "focus:outline-none focus:ring-2",
    headerClassName
  ].filter(Boolean).join(' ');

  const contentClasses = [
    "accordion-content",
    "overflow-hidden",
    rounded ? "rounded-b-2xl" : "rounded-none",
    theme.content,
    "border-t",
    contentClassName
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={containerClasses}
      role="region"
      aria-labelledby={`${accordionId}-header`}
    >
      {/* Header */}
      <button
        id={`${accordionId}-header`}
        type="button"
        className={headerClasses}
        onClick={toggleAccordion}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-controls={`${accordionId}-content`}
      >
        {/* Left content */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Icon */}
          {IconComponent && (
            <div className={`${theme.icon} ${sizeClass.icon} flex-shrink-0`}>
              <IconComponent />
            </div>
          )}
          
          {/* Title and subtitle */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <span className="font-semibold truncate">{title}</span>
              
              {/* Badge */}
              {badge && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800 flex-shrink-0">
                  {badge}
                </span>
              )}
            </div>
            
            {/* Subtitle */}
            {subtitle && (
              <p className="text-sm opacity-75 mt-1 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Chevron */}
        {collapsible && (
          <motion.div
            className={`${theme.icon} ${sizeClass.chevron} flex-shrink-0 ml-3`}
            variants={chevronVariants}
            animate={isOpen ? "open" : "closed"}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <FaChevronDown />
          </motion.div>
        )}
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`${accordionId}-content`}
            className={contentClasses}
            initial="closed"
            animate="open"
            exit="closed"
            variants={animated ? contentVariants : {}}
            role="region"
            aria-labelledby={`${accordionId}-header`}
          >
            <div
              ref={contentRef}
              className={`${sizeClass.content} leading-relaxed`}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Specialized accordion components for common use cases
export const InfoAccordion = ({ children, ...props }) => (
  <Accordion 
    variant="primary" 
    iconType="info" 
    {...props}
  >
    {children}
  </Accordion>
);

export const WarningAccordion = ({ children, ...props }) => (
  <Accordion 
    variant="warning" 
    iconType="warning" 
    {...props}
  >
    {children}
  </Accordion>
);

export const SuccessAccordion = ({ children, ...props }) => (
  <Accordion 
    variant="success" 
    iconType="success" 
    {...props}
  >
    {children}
  </Accordion>
);

export const TipAccordion = ({ children, ...props }) => (
  <Accordion 
    variant="purple" 
    iconType="tip" 
    badge="Tip"
    {...props}
  >
    {children}
  </Accordion>
);

export const LocationAccordion = ({ children, ...props }) => (
  <Accordion 
    variant="primary" 
    iconType="location" 
    {...props}
  >
    {children}
  </Accordion>
);

export const ActivityAccordion = ({ children, ...props }) => (
  <Accordion 
    variant="success" 
    iconType="activity" 
    {...props}
  >
    {children}
  </Accordion>
);

// Accordion group component for managing multiple accordions
export const AccordionGroup = ({ 
  children, 
  allowMultiple = false, 
  className = "",
  spacing = "medium"
}) => {
  const [openItems, setOpenItems] = useState(new Set());

  const spacingClasses = {
    none: "space-y-0",
    small: "space-y-2",
    medium: "space-y-4",
    large: "space-y-6"
  };

  const handleToggle = (index, isOpen) => {
    if (!allowMultiple) {
      // Close all others, open only this one
      setOpenItems(isOpen ? new Set([index]) : new Set());
    } else {
      // Toggle this item independently
      const newOpenItems = new Set(openItems);
      if (isOpen) {
        newOpenItems.add(index);
      } else {
        newOpenItems.delete(index);
      }
      setOpenItems(newOpenItems);
    }
  };

  return (
    <div className={`accordion-group ${spacingClasses[spacing]} ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && child.type === Accordion) {
          return React.cloneElement(child, {
            key: index,
            defaultOpen: openItems.has(index),
            onToggle: (isOpen) => handleToggle(index, isOpen)
          });
        }
        return child;
      })}
    </div>
  );
};

export default Accordion;