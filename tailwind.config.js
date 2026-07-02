/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0E1420",
          soft: "#131A2A",
          softer: "#1B2438",
          border: "#26304A",
        },
        paper: {
          DEFAULT: "#F6F3EC",
          soft: "#FFFFFF",
          border: "#E3DED0",
        },
        flame: {
          crimson: "#C8402C",
          gold: "#E3A72E",
          copper: "#2F9E6E",
          violet: "#7C4DAA",
          azure: "#3E7CB1",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 8px 30px -8px rgba(14, 20, 32, 0.35)",
        "card-light": "0 8px 24px -10px rgba(30, 41, 59, 0.18)",
      },
      borderRadius: {
        xl2: "1.1rem",
      },
    },
  },
  plugins: [],
};
