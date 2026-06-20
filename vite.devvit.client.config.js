import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: "src/devvit/client",
  base: "./",
  build: {
    outDir: "../../../dist/client",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      input: {
        splash: resolve("src/devvit/client/splash.html"),
        game: resolve("src/devvit/client/game.html"),
      },
    },
  },
});
