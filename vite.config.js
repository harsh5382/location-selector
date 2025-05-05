// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/opentripmap": {
        target: "https://api.opentripmap.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/opentripmap/, ""),
      },
      "/openweathermap": {
        target: "https://api.openweathermap.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/openweathermap/, ""),
      },
    },
  },
});
