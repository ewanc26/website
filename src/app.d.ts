// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	// Vite-defined globals (from vite.config.ts)
	const __APP_VERSION__: string;
	const __GIT_COMMIT__: string;
}

export {};
