import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

const r = (p) => fileURLToPath(new URL(p, import.meta.url));

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel({
    // Read from disk at runtime by the OG image endpoint (the resvg wasm is
    // picked up by the adapter's own dependency tracing).
    includeFiles: [
      "./node_modules/@fontsource/fraunces/files/fraunces-latin-300-normal.woff",
      "./node_modules/@fontsource/fraunces/files/fraunces-latin-400-italic.woff",
      "./src/lib/fonts/JetBrainsMono-Regular.ttf",
    ],
  }),
  integrations: [svelte({ compilerOptions: { runes: true } })],
  prefetch: { prefetchAll: false, defaultStrategy: "hover" },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // Keeps the existing src/lib code working unchanged while it is ported
      // off SvelteKit. Remove the shims as their call sites are rewritten.
      alias: {
        $lib: r("./src/lib"),
        "$env/static/public": r("./src/shims/env-public.ts"),
        "$env/dynamic/private": r("./src/shims/env-private.ts"),
        "$app/environment": r("./src/shims/app-environment.ts"),
        "$app/state": r("./src/shims/app-state.svelte.ts"),
      },
    },
    ssr: { noExternal: ["@lucide/svelte"] },
    assetsInclude: ["**/*.wasm"],
  },
});
