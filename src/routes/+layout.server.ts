import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => ({
	apInstanceUrl: process.env.PUBLIC_AP_INSTANCE_URL ?? null,
	apUsername: process.env.PUBLIC_AP_USERNAME ?? null
});
