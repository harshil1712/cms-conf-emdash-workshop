// @ts-check
import { defineConfig } from "astro/config";

// Fully static: the built `dist/` folder is served by a Worker with static assets.
export default defineConfig({
  output: "static",
  site: "https://emdash-workshop.workers.dev",
});
