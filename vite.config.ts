import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/stockfish.js",
          dest: "",
        },
      ],
    }),
  ],
  server: {
    host: true,
    port: 8866,
  },
});
