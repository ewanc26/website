import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	
	build: {
		// Optimize chunk splitting for better caching
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					// Only chunk client-side code, not SSR externals
					if (id.includes('node_modules')) {
						// Lucide icons - client-side only
						if (id.includes('@lucide/svelte')) {
							return 'lucide';
						}
						// HLS.js - client-side only
						if (id.includes('hls.js')) {
							return 'hls';
						}
						// Other vendor code
						return 'vendor';
					}
				}
			}
		},
		// Target modern browsers for smaller bundle size
		target: 'es2022',
		// Enable minification
		minify: 'esbuild',
		// Source maps for production debugging (set to false to reduce bundle size)
		sourcemap: false,
		// CSS code splitting
		cssCodeSplit: true,
		// Chunk size warnings
		chunkSizeWarningLimit: 1000
	},
	
	optimizeDeps: {
		include: ['@lucide/svelte', 'hls.js'],
		exclude: ['@atproto/api']
	},
	
	server: {
		// Development server configuration
		fs: {
			strict: true
		}
	},
	
	ssr: {
		// Don't externalize these in SSR
		noExternal: []
	}
});
