/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // "Spectrometer" palette: deep instrument-blue surfaces,
        // accents named after flame-test emission colours.
        ink: {
          DEFAULT: "#060912",
          soft: "#0C1220",
          softer: "#131B2D",
          border: "#1F2A44",
        },
        paper: {
          DEFAULT: "#EEF2F8",
          soft: "#FFFFFF",
          border: "#D5DDEB",
        },
        flame: {
          crimson: "#FF5C6C", // lithium
          gold: "#FFB547",    // sodium
          copper: "#2DD4A7",  // copper(II) green
          violet: "#A58BFF",  // potassium
          azure: "#5AAEFF",   // indium blue
        },
      },
      fontFamily: {
        display: ["'Bricolage Grotesque'", "system-ui", "sans-serif"],
        body: ["'Hanken Grotesk'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 18px 40px -22px rgba(0,0,0,0.7)",
        "card-light": "0 1px 2px rgba(15,23,42,0.06), 0 16px 32px -22px rgba(15,23,42,0.25)",
      },
      borderRadius: { xl2: "1.1rem" },
      keyframes: {
        orbit: { to: { transform: "rotate(360deg)" } },
        pulseRing: {
          "0%,100%": { opacity: "0.35" },
          "50%": { opacity: "0.9" },
        },
        rise: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        rise: "rise .6s cubic-bezier(.16,1,.3,1) both",
        pulseRing: "pulseRing 3.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
