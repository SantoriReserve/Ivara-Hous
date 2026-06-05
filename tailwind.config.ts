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
        black: "#000000",
        white: "#FFFFFF",
        "gray-light": "#F5F5F5",
        "gray-mid": "#6B6B6B",
        "gray-muted": "#999999",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["4.5rem", { lineHeight: "1", letterSpacing: "-0.03em" }],
        display: ["3.5rem", { lineHeight: "1.05", letterSpacing: "-0.025em" }],
        "headline-lg": ["2.5rem", { lineHeight: "1.08", letterSpacing: "-0.02em" }],
        headline: ["2rem", { lineHeight: "1.12", letterSpacing: "-0.015em" }],
      },
      letterSpacing: {
        luxury: "0.32em",
        editorial: "0.2em",
        nav: "0.14em",
      },
      spacing: {
        section: "7.5rem",
        "section-lg": "10rem",
      },
      transitionDuration: {
        luxury: "500ms",
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      maxWidth: {
        prose: "42rem",
      },
    },
  },
  plugins: [],
};

export default config;
