import adapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    // Explicit runtime avoids adapter-vercel erroring on local Node versions
    // it doesn't recognise (e.g. 26) — the actual deployed function always
    // runs on Vercel's own infrastructure regardless of the local version.
    adapter: adapter({ runtime: "nodejs24.x" }),
  },
};

export default config;
