import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	
	build: {
		// Optimize chunk splitting for better caching
		rollupOptions: {
			output: {
				manualChunks: {
					// Split vendor code into separate chunks
					'atproto': ['@atproto/api'],
					'lucide': ['@lucide/svelte'],
					'hls': ['hls.js']
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
		include: ['@atproto/api', '@lucide/svelte', 'hls.js'],
		exclude: []
	},
	
	server: {
		// Development server configuration
		fs: {
			strict: true
		}
	}
});
