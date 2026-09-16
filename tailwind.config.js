/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#05091a',
          900: '#0a1228',
          800: '#0f1a38',
          700: '#16244a',
          600: '#1e2e5c',
        },
        blue: {
          500: '#5b7fff',
          400: '#7b9dff',
          300: '#a0b8ff',
          200: '#c5d3ff',
        },
        success: '#4ade80',
        warning: '#fbbf24',
        error: '#f87171',
      },
      fontFamily: {
        sans: ['Inter', 'Nunito', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
