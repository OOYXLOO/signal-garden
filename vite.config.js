import { defineConfig } from "vite";

export default defineConfig({
  build: {
    emptyOutDir: false,
    chunkSizeWarningLimit: 1400,
  },
});
