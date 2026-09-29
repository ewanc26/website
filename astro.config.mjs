import { defineConfig } from "astro/config";
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
      "./node_modules/@fontsource/archivo-black/files/archivo-black-latin-400-normal.woff",
      "./src/lib/fonts/JetBrainsMono-Regular.ttf",
    ],
  }),
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
      },
    },
    assetsInclude: ["**/*.wasm"],
  },
});
