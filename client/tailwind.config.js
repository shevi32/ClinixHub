/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Rubik", "system-ui", "sans-serif"],
      },
      colors: {
        joy: {
          teal: "#14b8a6",
          coral: "#ff6b6b",
          sun: "#ffd166",
          grape: "#a78bfa",
          sky: "#38bdf8",
        },
      },
      backgroundImage: {
        "joy-gradient": "linear-gradient(135deg, #14b8a6 0%, #38bdf8 45%, #a78bfa 100%)",
        "joy-warm": "linear-gradient(135deg, #ff6b6b 0%, #ffd166 100%)",
      },
      boxShadow: {
        joy: "0 10px 30px -8px rgba(20, 184, 166, 0.35)",
        pop: "0 8px 20px -4px rgba(0,0,0,0.12)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        popIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(20px, -30px) scale(1.1)" },
          "66%": { transform: "translate(-15px, 15px) scale(0.95)" },
        },
      },
      animation: {
        float: "float 3.5s ease-in-out infinite",
        wiggle: "wiggle 1.2s ease-in-out infinite",
        "pop-in": "popIn 0.25s ease-out",
        blob: "blob 9s ease-in-out infinite",
      },
      borderRadius: {
        blob: "42% 58% 65% 35% / 45% 40% 60% 55%",
      },
    },
  },
  plugins: [],
};
