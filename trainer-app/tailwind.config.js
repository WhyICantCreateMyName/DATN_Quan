/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
         ptPrimary: '#F59E0B',
         ptDark: '#1F2937',
         ptBlack: '#111827',
      }
    },
  },
  plugins: [],
}
