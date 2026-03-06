import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = (p: string) => path.resolve(__dirname, 'packages', p);

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],

	resolve: {
		// Point workspace packages directly at source — applies to both client and SSR,
		// so no pre-build step is needed for `pnpm dev`.
		alias: {
			'@ewanc26/atproto': pkg('atproto/src/index.ts'),
			'@ewanc26/utils': pkg('utils/src/index.ts'),
			'@ewanc26/ui': pkg('ui/src/lib/index.ts')
		}
	},

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
		include: ['@lucide/svelte', 'hls.js', '@atproto/api']
	},

	server: {
		// Development server configuration
		fs: {
			strict: true,
			// Allow Vite to serve workspace package source files resolved via alias.
			allow: ['packages', 'src', 'node_modules']
		}
	},

	ssr: {
		// Don't externalize these in SSR
		noExternal: []
	}
});
