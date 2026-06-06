/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        atkinson: ["Atkinson-Regular"],
        "atkinson-bold": ["Atkinson-Bold"],
      }
    },
  },
  plugins: [],
}