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
          dark: "#0B0E17",       // TradeZella Deep Midnight Canvas
          light: "#F4F6FA",      // TradeZella Soft Slate Canvas
        },
        surface: {
          dark: "#161928",       // TradeZella Dark Elevated Card
          light: "#FFFFFF",      // TradeZella Pure White Card
        },
        card: {
          dark: "rgba(22, 25, 40, 0.95)",
          light: "rgba(255, 255, 255, 0.95)",
        },
        holst: {
          bg: "#0B0E17",        // TradeZella Dark Canvas
          surface: "#161928",   // TradeZella Dark Card Surface
          steel: "#22283E",     // TradeZella Delicate Border
          sage: "#00C48C",      // TradeZella Vibrant Mint Green (Win)
          sand: "#4F46E5",      // TradeZella Royal Indigo (Primary Action)
          cream: "#FFFFFF",     // Crisp Pure White
          terracotta: "#F43F5E",// TradeZella Coral Rose (Loss)
          muted: "#8E98B0",     // Muted Blue-Slate Text
          accent: "#4F46E5",    // TradeZella Indigo Accent
          warning: "#F59E0B",   // TradeZella Amber
        },
        brand: {
          cyan: "#4F46E5",
          violet: "#4F46E5",
          emerald: "#00C48C",
          amber: "#F59E0B",
          rose: "#F43F5E",
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
        glass: "0 10px 30px 0 rgba(0, 0, 0, 0.4)",
        glow: "0 0 24px rgba(79, 70, 229, 0.25)",
        "glass-light": "0 2px 10px rgba(0, 0, 0, 0.04)",
        "neon-cyan": "0 0 25px rgba(79, 70, 229, 0.35)",
        "neon-violet": "0 0 25px rgba(79, 70, 229, 0.35)",
        "neon-emerald": "0 0 25px rgba(0, 196, 140, 0.35)",
        "neon-rose": "0 0 25px rgba(244, 63, 94, 0.35)",
        "neon-gold": "0 0 25px rgba(245, 158, 11, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
