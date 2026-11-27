import adapter from "@sveltejs/adapter-vercel";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      preprocess: vitePreprocess(),
      // Explicit runtime avoids adapter-vercel erroring on local Node versions
      // it doesn't recognise (e.g. 26) — the actual deployed function always
      // runs on Vercel's own infrastructure regardless of the local version.
      adapter: adapter({ runtime: "nodejs24.x" }),
    }),
  ],
  assetsInclude: ["**/*.wasm"],
});
