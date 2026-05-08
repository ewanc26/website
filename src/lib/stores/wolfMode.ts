export { wolfMode } from '@ewanc26/ui';
export type { wolfMode as wolfModeType } from '@ewanc26/ui';

import { get } from 'svelte/store';
import { wolfMode as baseWolfMode } from '@ewanc26/ui';

// Re-apply wolf mode when new content is injected into the DOM
// (async cards, dynamic data, etc.) while wolf mode is active.
if (typeof window !== 'undefined') {
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	const observer = new MutationObserver((mutations) => {
		if (!get(baseWolfMode)) return;

		const hasNewContent = mutations.some((m) => m.addedNodes.length > 0);
		if (!hasNewContent) return;

		// Debounce: wait for the current batch of mutations to settle
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			if (get(baseWolfMode)) baseWolfMode.enable();
		}, 100);
	});

	const start = () => {
		observer.observe(document.body, { childList: true, subtree: true });
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start);
	} else {
		start();
	}
}
