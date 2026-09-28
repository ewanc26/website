/** Stand-in for SvelteKit's `$app/environment`. */
export const browser = typeof window !== "undefined";
export const dev = import.meta.env.DEV;
