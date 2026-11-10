// @ts-check
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { defineConfig, fontProviders } from "astro/config";
import emdash from "emdash/astro";

// The guide is an EmDash site: steps and parts live in D1 and are edited in the admin.
// seed/seed.json holds the schema and the starting content.
export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  site: "https://emdash-workshop.workers.dev",
  integrations: [
    react(),
    emdash({
      database: d1({ binding: "DB", session: "auto", coalesce: true }),
      storage: r2({ binding: "MEDIA" }),
    }),
  ],
  // Inter, self-hosted by Astro; <Font> in Base.astro owns --font-sans.
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Inter",
      cssVariable: "--font-sans",
      weights: [400, 500, 600, 700],
      fallbacks: ["Arial", "sans-serif"],
    },
  ],
  devToolbar: { enabled: false },
});
