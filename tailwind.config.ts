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
          dark: "#15171E",
          light: "#ffffff",
        },
        card: {
          dark: "rgba(21, 23, 30, 0.9)",
          light: "rgba(255, 255, 255, 0.8)",
        },
        holst: {
          bg: "#0B0C10",        // Deep Matte Obsidian
          surface: "#15171E",   // Sleek Charcoal Card Surface
          steel: "#232732",     // Dark Titanium Border/Divider
          sage: "#10B981",      // Vivid Neon Emerald (profit, win)
          sand: "#F59E0B",      // Solar Amber / Vivid Gold (primary accent, gauges)
          cream: "#FFFFFF",     // Crisp Pure White (primary text)
          terracotta: "#EF4444",// Vivid Crimson (loss, drawdown, alert)
          muted: "#94A3B8",     // Slate Gray (secondary text, labels)
        },
        brand: {
          cyan: "#38BDF8",
          violet: "#232732",
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
        glass: "0 12px 40px 0 rgba(0, 0, 0, 0.7)",
        "glass-light": "0 10px 30px -5px rgba(0, 0, 0, 0.05)",
        "neon-cyan": "0 0 25px rgba(56, 189, 248, 0.35)",
        "neon-violet": "0 0 25px rgba(35, 39, 50, 0.35)",
        "neon-emerald": "0 0 25px rgba(16, 185, 129, 0.4)",
        "neon-rose": "0 0 25px rgba(239, 68, 68, 0.4)",
        "neon-gold": "0 0 25px rgba(245, 158, 11, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
