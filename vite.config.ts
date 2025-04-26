import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    build: {
        target: 'esnext',
        minify: 'esbuild',
        sourcemap: true
    },
    server: {
        headers: {
            'Content-Security-Policy': "default-src 'self'; script-src 'self'; connect-src 'self' https://public.api.bsky.app https://bsky.social; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-src 'none'; object-src 'none';",
            'Access-Control-Allow-Origin': "*",
            'Access-Control-Allow-Methods': "GET, POST, OPTIONS",
            'Access-Control-Allow-Headers': "Content-Type"
        }
    }
});
