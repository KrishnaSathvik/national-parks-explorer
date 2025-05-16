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
      },

      // 🎬 Animations
      animation: {
        'fade-in-up': 'fade-in-up 0.3s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
