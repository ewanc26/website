import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	
	kit: {
		adapter: adapter({
			// Vercel adapter configuration
			runtime: 'nodejs20.x',
			regions: ['iad1'], // Default to US East (adjust based on your target audience)
			split: false, // Set to true to deploy routes as individual functions
			
			// Edge runtime configuration (uncomment to use Edge Functions)
			// runtime: 'edge',
			// regions: 'all', // Deploy to all edge regions
			
			// Memory and execution limits
			memory: 1024, // MB (256, 512, 1024, 3008)
			maxDuration: 10 // seconds (max execution time)
		}),
		
		// Alias configuration for cleaner imports
		alias: {
			$components: 'src/lib/components',
			$lib: 'src/lib',
			$utils: 'src/lib/utils',
			$services: 'src/lib/services',
			$helper: 'src/lib/helper'
		},
		
		// Prerender configuration
		prerender: {
			handleHttpError: 'warn',
			handleMissingId: 'warn',
			entries: ['*'] // Prerender all discoverable pages
		},
		
		// CSP configuration for security
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': ['self', 'unsafe-inline'],
				'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
				'style-src-elem': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
				'img-src': ['self', 'data:', 'https:'],
				'font-src': ['self', 'data:', 'https://fonts.gstatic.com'],
				'connect-src': ['self', 'https:'],
				'media-src': ['self', 'https:']
			}
		}
	}
};

export default config;
