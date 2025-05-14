/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Open Sans"', 'sans-serif'],         // Body font
        heading: ['"Montserrat"', 'sans-serif'],     // Heading font
      },
      colors: {
        pink: {
          DEFAULT: '#FF385C',        // Airbnb's primary pink
        },
        gray: {
          50: '#f9f9f9',
          100: '#f3f4f6',
          200: '#e5e7eb',
          800: '#1f2937',
        },
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.08)',         // Subtle shadow for cards
      },
      borderRadius: {
        xl: '1.5rem',                                // Smoother curves for UI
        '2xl': '2rem',
      },
    },
  },
  plugins: [],
}
