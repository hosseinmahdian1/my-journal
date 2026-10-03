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
          dark: "#0B0E1A",
          light: "#f8fafc",
        },
        surface: {
          dark: "#141829",
          light: "#ffffff",
        },
        card: {
          dark: "rgba(20, 24, 41, 0.9)",
          light: "rgba(255, 255, 255, 0.8)",
        },
        holst: {
          bg: "#0B0E1A",        // Midnight Indigo (نیلی خیلی تیره)
          surface: "#141829",   // Card Surface
          steel: "#2A3050",     // Border & Divider
          sage: "#34D399",      // Success (موفقیت / سبز زمردی نئون)
          sand: "#7C5CFF",      // Primary (بنفش الکتریکی)
          cream: "#E6E8F2",     // Text (متن اصلی)
          terracotta: "#F87171",// Danger (خطا / قرمز مرجانی)
          muted: "#8892B0",     // Text Muted (متن ثانویه)
          accent: "#22D3EE",    // Accent (فیروزه‌ای نئون)
          warning: "#FBBF24",   // Warning (هشدار / کهربایی)
        },
        brand: {
          cyan: "#22D3EE",
          violet: "#7C5CFF",
          emerald: "#34D399",
          amber: "#FBBF24",
          rose: "#F87171",
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
        glass: "0 12px 40px 0 rgba(11, 14, 26, 0.7)",
        "glass-light": "0 10px 30px -5px rgba(0, 0, 0, 0.05)",
        "neon-cyan": "0 0 25px rgba(34, 211, 238, 0.4)",
        "neon-violet": "0 0 25px rgba(124, 92, 255, 0.4)",
        "neon-emerald": "0 0 25px rgba(52, 211, 153, 0.4)",
        "neon-rose": "0 0 25px rgba(248, 113, 113, 0.4)",
        "neon-gold": "0 0 25px rgba(124, 92, 255, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
