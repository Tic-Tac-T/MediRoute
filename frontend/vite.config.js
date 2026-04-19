import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Proxy /triage and /health API calls to the backend during development
      "/triage": {
        target: "https://mediroute-2ba2.onrender.com",
        changeOrigin: true,
      },
      "/health": {
        target: "https://mediroute-2ba2.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
