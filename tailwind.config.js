/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // "Study desk" palette: chalkboard-green surfaces with
        // highlighter, red-pen, chalk and notebook-ink accents.
        ink: {
          DEFAULT: "#07130F", // chalkboard
          soft: "#0D1F19",
          softer: "#142D25",
          border: "#21473B",
        },
        paper: {
          DEFAULT: "#EDF5EE", // mint notebook paper
          soft: "#FFFFFF",
          border: "#CBDECF",
        },
        flame: {
          crimson: "#FF6B6B", // red margin pen
          gold: "#FFD84D",    // highlighter yellow
          copper: "#5EE6B0",  // chalk mint
          violet: "#9BA9FF",  // notebook ink
          azure: "#6CC4FF",   // ruled-line blue
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
