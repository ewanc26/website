import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
		prerender: {
			entries: ['*']
		},
		csp: {
			mode: 'auto',
			directives: {
				'script-src': ['self', 'https://public.api.bsky.app'],
				'script-src-elem': ['self', 'unsafe-inline', 'https://public.api.bsky.app'],
				'connect-src': ['self', 'https://public.api.bsky.app'],
				'style-src': ['self', 'unsafe-inline']
			}
		}
	}
};

export default config;
