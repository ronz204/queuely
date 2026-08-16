import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      "@features": "/source/features",
      "@domain": "/source/domain",
      "@stores": "/source/stores",
      "@components": "/source/components",
    },
  },
});
