/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4CAF50',
          DEFAULT: '#2E7D32', // Pastel green accent
          dark: '#1B5E20',
        },
        secondary: {
          light: '#c4d110',
          DEFAULT: '#9ec626', // Yellow-green from logo
          dark: '#a3cf2b',
        },
        background: '#FAFAFA',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        brand: ['Quicksand', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
