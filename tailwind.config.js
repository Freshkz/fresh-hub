/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0F",
        surface: "#121218",
        surface2: "#17171F",
        border: "#25252F",
        accent: "#7C5CFF",
        accent2: "#33E6B0",
        text: "#F2F1F7",
        muted: "#8B8996",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        accentGlow: "0 8px 24px -8px rgba(124,92,255,0.6)",
      },
    },
  },
  plugins: [],
};
