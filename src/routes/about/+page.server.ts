import type { PageServerLoad } from './$types';
import { fetchProfile } from '$lib/services/atproto/fetch';

export const load: PageServerLoad = async () => {
    const profile = await fetchProfile();
    return {
        profile
    };
};
