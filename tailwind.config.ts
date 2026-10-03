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
          dark: "#050507",
          light: "#f8fafc",
        },
        surface: {
          dark: "#0F1016",
          light: "#ffffff",
        },
        card: {
          dark: "rgba(15, 16, 22, 0.85)",
          light: "rgba(255, 255, 255, 0.8)",
        },
        holst: {
          bg: "#050507",        // Apple Void Black
          surface: "#0F1016",   // Stealth Frosted Glass
          steel: "#1E2028",     // Hairline Border
          sage: "#00E676",      // Terminal Cyber Mint (Win)
          sand: "#00E5FF",      // Electric Ice Cyan (Primary Accent)
          cream: "#FFFFFF",     // Apple Crisp White
          terracotta: "#FF334B",// Vivid Coral Crimson (Loss)
          muted: "#8E92A4",     // Sleek Muted Silver
          accent: "#00E5FF",    // Cyber Cyan
          warning: "#FFB800",   // Electric Amber
        },
        brand: {
          cyan: "#00E5FF",
          violet: "#00E5FF",
          emerald: "#00E676",
          amber: "#FFB800",
          rose: "#FF334B",
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
        glow: "0 0 24px rgba(0, 229, 255, 0.25)",
        "glass-light": "0 10px 30px -5px rgba(0, 0, 0, 0.05)",
        "neon-cyan": "0 0 25px rgba(0, 229, 255, 0.4)",
        "neon-violet": "0 0 25px rgba(0, 229, 255, 0.4)",
        "neon-emerald": "0 0 25px rgba(0, 230, 118, 0.4)",
        "neon-rose": "0 0 25px rgba(255, 51, 75, 0.4)",
        "neon-gold": "0 0 25px rgba(255, 184, 0, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
