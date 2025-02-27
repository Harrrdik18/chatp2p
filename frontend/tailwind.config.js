/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'dots-gray': 'radial-gradient(circle, #E5E7EB 1.5px, transparent 1.5px)',
      },
      backgroundSize: {
        'dots': '8px 8px',
      },
    },
  },
  plugins: [],
} 