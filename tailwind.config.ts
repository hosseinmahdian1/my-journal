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
          dark: "#0B0C10",
          light: "#f8fafc",
        },
        surface: {
          dark: "#14161D",
          light: "#ffffff",
        },
        card: {
          dark: "rgba(20, 22, 29, 0.9)",
          light: "rgba(255, 255, 255, 0.8)",
        },
        holst: {
          bg: "#0B0C10",        // Deep Obsidian Matte Black
          surface: "#14161D",   // Elevated Charcoal Container
          steel: "#232734",     // Subtle Hairline Border
          sage: "#10B981",      // Tactical Emerald Green (Win)
          sand: "#F59E0B",      // Warm Solar Amber (Primary Accent)
          cream: "#FFFFFF",     // Crisp Pure White
          terracotta: "#EF4444",// Modern Crimson (Loss)
          muted: "#94A3B8",     // Slate Silver Muted Text
          accent: "#F59E0B",    // Solar Amber Accent
          warning: "#F59E0B",   // Amber Warning
        },
        brand: {
          cyan: "#F59E0B",
          violet: "#F59E0B",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#EF4444",
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
        glass: "0 12px 40px 0 rgba(0, 0, 0, 0.85)",
        glow: "0 0 24px rgba(245, 158, 11, 0.22)",
        "glass-light": "0 10px 30px -5px rgba(0, 0, 0, 0.05)",
        "neon-cyan": "0 0 25px rgba(245, 158, 11, 0.35)",
        "neon-violet": "0 0 25px rgba(245, 158, 11, 0.35)",
        "neon-emerald": "0 0 25px rgba(16, 185, 129, 0.35)",
        "neon-rose": "0 0 25px rgba(239, 68, 68, 0.35)",
        "neon-gold": "0 0 25px rgba(245, 158, 11, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
