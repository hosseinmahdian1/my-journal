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
          dark: "#09090b",
          light: "#fafafa",
        },
        surface: {
          dark: "#121215",
          light: "#ffffff",
        },
        card: {
          dark: "rgba(24, 24, 27, 0.75)",
          light: "#ffffff",
        },
        border: {
          dark: "#27272a",
          light: "#e4e4e7",
        },
        brand: {
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
          zinc: "#71717a",
        },
      },
      fontFamily: {
        sans: ["'SF Pro'", "'SF Arabic'", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        persian: ["'SF Arabic'", "'SF Pro'", "Vazirmatn", "Tahoma", "sans-serif"],
      },
      boxShadow: {
        fintech: "0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px -1px rgba(0, 0, 0, 0.2)",
        "fintech-card": "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;

