/**
 * Stand-in for SvelteKit's `$env/dynamic/private`. Astro only exposes
 * PUBLIC_ variables on `import.meta.env` at runtime, so private values come
 * from `process.env` (Vercel) with `import.meta.env` covering local `.env`.
 */
export const env: Record<string, string | undefined> = new Proxy(
  {},
  {
    get: (_, key: string) =>
      process.env[key] ??
      (import.meta.env as Record<string, string | undefined>)[key],
  },
);
