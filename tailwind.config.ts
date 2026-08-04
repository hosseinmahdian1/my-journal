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
          dark: "#000000",
          light: "#f8fafc",
        },
        surface: {
          dark: "#08080a",
          light: "#ffffff",
        },
        card: {
          dark: "rgba(12, 12, 16, 0.7)",
          light: "rgba(255, 255, 255, 0.8)",
        },
        brand: {
          cyan: "#06b6d4",
          violet: "#8b5cf6",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        persian: ["Vazirmatn", "Tahoma", "sans-serif"],
      },
      backdropBlur: {
        glass: "24px",
      },
      boxShadow: {
        glass: "0 12px 40px 0 rgba(0, 0, 0, 0.5)",
        "glass-light": "0 10px 30px -5px rgba(0, 0, 0, 0.05)",
        "neon-cyan": "0 0 25px rgba(6, 182, 212, 0.3)",
        "neon-violet": "0 0 25px rgba(139, 92, 246, 0.3)",
        "neon-emerald": "0 0 25px rgba(16, 185, 129, 0.3)",
        "neon-rose": "0 0 25px rgba(244, 63, 94, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
