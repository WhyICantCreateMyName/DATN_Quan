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
        memberPrimary: '#0ea5e9', // Blue
        memberBlack: '#0f172a',
        memberDark: '#1e293b'
      }
    },
  },
  plugins: [],
}
