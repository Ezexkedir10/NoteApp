import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#EDF0F5",
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#1B2333",
          soft: "#566075",
          faint: "#6F788C",
        },
        line: {
          DEFAULT: "#D9DEE8",
          strong: "#BAC3D3",
        },
        accent: {
          DEFAULT: "#3340E8",
          hover: "#2631C9",
          soft: "#E8EAFD",
        },
        danger: {
          DEFAULT: "#C93C3C",
          hover: "#AD2E2E",
          soft: "#FBEBEB",
        },
        success: {
          DEFAULT: "#17803D",
          soft: "#E6F5EB",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(27, 35, 51, 0.04), 0 1px 3px rgba(27, 35, 51, 0.07)",
        lifted: "0 12px 28px -10px rgba(27, 35, 51, 0.22)",
      },
    },
  },
  plugins: [],
};

export default config;
