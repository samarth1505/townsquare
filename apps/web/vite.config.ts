import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  server: { port: 5173, strictPort: true }, // API allows CORS only from this origin
  // "hidden": source maps are produced but not linked from the JS files, so users cannot read our source, while an
  // error service that you upload them to can turn minified stack traces back into real file and line numbers.
  build: { sourcemap: "hidden" },
  test: {
    environment: "jsdom", // a fake browser (window, document) running inside Node
    setupFiles: ["./src/test/setup.ts"],
    css: false, // class names are enough for these tests; skip processing stylesheets
  },
});
