import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/solo-rpg-toolkit/",
  server: { host: true },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Solo RPG Companion",
        short_name: "SoloRPG",
        description: "Mobilní PWA pro sólové hraní stolních RPG — Mausritter + Mythic GME 2e.",
        theme_color: "#faf9f6",
        background_color: "#faf9f6",
        display: "standalone",
        orientation: "any",
        icons: [
          {
            src: "favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],
      },
    }),
  ],
});
