import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172026",
        paper: "#f7f9fb",
        brand: "#2563eb",
        mint: "#14b8a6",
        amber: "#f59e0b"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(23, 32, 38, 0.10)"
      }
    },
  },
  plugins: [],
};

export default config;

