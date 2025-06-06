/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 🔤 Enhanced Fonts
      fontFamily: {
        sans: ['Inter', '"Open Sans"', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },

      // 🎨 Enhanced Color System
      colors: {
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899', // Your main pink
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#8b5cf6', // Your secondary purple
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        accent: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Your accent blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Keep your existing gray scale
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // Add success, warning, error colors
        success: {
          50: '#ecfdf5',
          500: '#10b981',
          600: '#059669',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
      },

      // 🌟 Enhanced Shadows
      boxShadow: {
        'card': '0 2px 12px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 25px rgba(0,0,0,0.15)',
        'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
        'glow': '0 0 20px rgba(236, 72, 153, 0.15)',
        'glow-lg': '0 0 40px rgba(236, 72, 153, 0.2)',
      },

      // 🟦 Enhanced Border Radius
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },

      // 📏 Enhanced Spacing
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // 🎞️ Enhanced Keyframes
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'slide-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'slide-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'scale-in': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.95)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          },
        },
        'shimmer': {
          '0%': {
            backgroundPosition: '-200% 0'
          },
          '100%': {
            backgroundPosition: '200% 0'
          },
        },
        'pop': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },

      // 🎬 Enhanced Animations
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'scale-in': 'scale-in 0.4s ease-out',
        'shimmer': 'shimmer 2s infinite linear',
        'pop': 'pop 0.3s ease-in-out',
        'bounce-gentle': 'bounce-gentle 2s infinite',
        'pulse-soft': 'pulse-soft 2s infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
      },

      // 💎 Enhanced Background Images
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
        'gradient-accent': 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
        'shimmer': 'linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.5) 50%, transparent 75%)',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },

      // 🔁 Enhanced Transforms
      rotate: {
        'y-180': '180deg',
        '15': '15deg',
        '30': '30deg',
      },

      // 📐 Transform Origins
      transformOrigin: {
        'center': 'center',
        'top-left': 'top left',
        'top-right': 'top right',
        'bottom-left': 'bottom left',
        'bottom-right': 'bottom right',
      },

      // 🎯 Z-Index Scale
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },

      // 📱 Enhanced Screens (for better responsive design)
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },

      // ⏱️ Enhanced Transition Durations
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '900': '900ms',
      },

      // 🌊 Enhanced Transition Timing Functions
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'snappy': 'cubic-bezier(0.4, 0, 0.6, 1)',
      },

      // 📏 Enhanced Line Heights
      lineHeight: {
        'extra-loose': '2.5',
        '12': '3rem',
      },

      // 🔤 Enhanced Letter Spacing
      letterSpacing: {
        'extra-wide': '0.1em',
      },

      // 📝 Enhanced Font Sizes
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
    },
  },
  plugins: [
    // Use ES6 imports for plugins
    import('@tailwindcss/typography'),
    import('@tailwindcss/forms'),
    import('@tailwindcss/aspect-ratio'),
    // Custom plugin for additional utilities
    function({ addUtilities }) {
      const newUtilities = {
        '.text-shadow': {
          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
        '.text-shadow-lg': {
          textShadow: '0 4px 8px rgba(0,0,0,0.2)',
        },
        '.backdrop-blur-glass': {
          backdropFilter: 'blur(16px)',
          '-webkit-backdrop-filter': 'blur(16px)',
        },
        '.safe-area': {
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        },
        // Mobile-first touch targets
        '.touch-target': {
          minHeight: '44px',
          minWidth: '44px',
        },
        // GPU acceleration for smooth animations
        '.gpu': {
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
        },
      }
      addUtilities(newUtilities)
    }
  ],
  // Future-proof configuration
  future: {
    hoverOnlyWhenSupported: true,
  },
  // Experimental features
  experimental: {
    optimizeUniversalDefaults: true,
  },
}