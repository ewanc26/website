import { writable } from 'svelte/store';

interface HappyMacState {
	clickCount: number;
	isTriggered: boolean;
}

function createHappyMacStore() {
	const { subscribe, set, update } = writable<HappyMacState>({
		clickCount: 0,
		isTriggered: false
	});

	return {
		subscribe,
		incrementClick: () =>
			update((state) => {
				const newCount = state.clickCount + 1;
				// Trigger when reaching 24 clicks (Mac announcement date: 24/01/1984)
				if (newCount === 24) {
					return { clickCount: newCount, isTriggered: true };
				}
				return { ...state, clickCount: newCount };
			}),
		reset: () => set({ clickCount: 0, isTriggered: false })
	};
}

export const happyMacStore = createHappyMacStore();
