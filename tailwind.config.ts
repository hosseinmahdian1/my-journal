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
          dark: "#0D1B2A",
          light: "#f8fafc",
        },
        surface: {
          dark: "#1B263B",
          light: "#ffffff",
        },
        card: {
          dark: "rgba(27, 38, 59, 0.85)",
          light: "rgba(255, 255, 255, 0.8)",
        },
        holst: {
          bg: "#0D1B2A",        // Rich Midnight Navy
          surface: "#1B263B",   // Prussian Slate Navy
          steel: "#415A77",     // Muted Steel Blue
          sage: "#778D7A",      // Muted Sage Green (profit, win)
          sand: "#D4C4A8",      // Warm Sand Gold (primary accent, highlights)
          cream: "#F4F1DE",     // Antique Alabaster (primary text)
          terracotta: "#C06C58",// Vintage Terracotta (loss, drawdown, alert)
        },
        brand: {
          cyan: "#597599",
          violet: "#415A77",
          emerald: "#778D7A",
          amber: "#D4C4A8",
          rose: "#C06C58",
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
        glass: "0 12px 40px 0 rgba(13, 27, 42, 0.6)",
        "glass-light": "0 10px 30px -5px rgba(0, 0, 0, 0.05)",
        "neon-cyan": "0 0 25px rgba(89, 117, 153, 0.35)",
        "neon-violet": "0 0 25px rgba(65, 90, 119, 0.35)",
        "neon-emerald": "0 0 25px rgba(119, 141, 122, 0.35)",
        "neon-rose": "0 0 25px rgba(192, 108, 88, 0.35)",
        "neon-gold": "0 0 25px rgba(212, 196, 168, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
