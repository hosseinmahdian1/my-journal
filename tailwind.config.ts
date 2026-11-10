import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          dark: "#080b11",
          light: "#f8fafc",
        },
        surface: {
          dark: "#0e131f",
          light: "#ffffff",
        },
        card: {
          dark: "rgba(14, 19, 31, 0.75)",
          light: "rgba(255, 255, 255, 0.9)",
        },
        brand: {
          cyan: "#06b6d4",
          violet: "#8b5cf6",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
          gold: "#d97706",
          navy: "#0a192f",
        },
        fintech: {
          profit: "#10b981",
          loss: "#f43f5e",
          gold: "#f59e0b",
          cyan: "#06b6d4",
          slate: "#1e293b",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        persian: ["Vazirmatn", "Tahoma", "sans-serif"],
        mono: ["Consolas", "Courier New", "monospace"],
      },
      animation: {
        ticker: "ticker 35s linear infinite",
        "pulse-subtle": "pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      backdropBlur: {
        glass: "24px",
        subtle: "12px",
      },
      boxShadow: {
        glass: "0 12px 40px 0 rgba(0, 0, 0, 0.45)",
        "glass-light": "0 10px 30px -5px rgba(0, 0, 0, 0.05)",
        "metallic-gold": "0 10px 30px -5px rgba(245, 158, 11, 0.25)",
        "metallic-dark": "0 20px 40px -10px rgba(0, 0, 0, 0.6)",
        "neon-cyan": "0 0 25px rgba(6, 182, 212, 0.3)",
        "neon-emerald": "0 0 25px rgba(16, 185, 129, 0.3)",
        "neon-rose": "0 0 25px rgba(244, 63, 94, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;

