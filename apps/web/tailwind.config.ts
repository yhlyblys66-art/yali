import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0A0E1A",
        "card-bg": "#111827",
        "card-border": "#1E293B",
        muted: "#6B7280",
        accent: "#DC2626",
        "accent-dark": "#991B1B",
        "grid-line": "#1A2035",
        "section-bg": "#0D1117",
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
      },
      maxWidth: {
        container: "1200px",
      },
      animation: {
        "marquee": "marquee 20s linear infinite",
        "sparkle": "sparkle 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.6s ease forwards",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        sparkle: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
