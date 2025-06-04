/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 🔤 Fonts
      fontFamily: {
        sans: ['"Open Sans"', 'sans-serif'],
        heading: ['"Montserrat"', 'sans-serif'],
      },

      // 🎨 Colors
      colors: {
        pink: {
          DEFAULT: '#FF385C',
        },
        gray: {
          50: '#f9f9f9',
          100: '#f3f4f6',
          200: '#e5e7eb',
          800: '#1f2937',
        },
      },

      // 🌟 Shadows
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.08)',
      },

      // 🟦 Border Radius
      borderRadius: {
        xl: '1.5rem',
        '2xl': '2rem',
      },

      // 🎞️ Keyframes
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-100% 0' },
          '100%': { backgroundPosition: '100% 0' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
      },

      // ADD to the extend section:
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },

      // 🎬 Animations
      animation: {
        'fade-in-up': 'fade-in-up 0.3s ease-out',
        shimmer: 'shimmer 1.5s infinite linear',
        pop: 'pop 0.3s ease-in-out',
      },

      // 💎 Background Image (for shimmer loader if needed)
      backgroundImage: {
        shimmer: 'linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%)',
      },

      // 🔠 Line clamp
      lineClamp: {
        3: '3',
        5: '5',
      },

      // 🔁 Rotation for flip card
      rotate: {
        'y-180': '180deg',
      },

      // 🧩 Transform utilities (needed for 3D perspective)
      transformOrigin: {
        'center': 'center',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
  ],
};