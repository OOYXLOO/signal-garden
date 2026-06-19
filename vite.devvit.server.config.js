import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    outDir: "dist/devvit-server",
    emptyOutDir: true,
    target: "node22",
    lib: {
      entry: resolve("src/devvit/server/index.js"),
      formats: ["cjs"],
      fileName: () => "index.cjs",
    },
    rollupOptions: {
      external: [],
      output: {
        exports: "named",
      },
    },
  },
});
