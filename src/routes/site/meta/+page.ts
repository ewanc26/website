import type { PageLoad } from './$types';
import { fetchSiteInfo, type SiteInfoData } from '$lib/services/atproto';
import { createSiteMeta, type SiteMetadata, defaultSiteMeta } from '$lib/helper/siteMeta';
import { ogImages } from '$lib/helper/ogImages';

export const load: PageLoad = async ({ parent, fetch }) => {
  const { siteMeta } = await parent();

  let siteInfo: SiteInfoData | null = null;
  let error: string | null = null;

    try {
    siteInfo = await fetchSiteInfo(fetch);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load site information';
  }

  const meta: SiteMetadata = createSiteMeta({
    ...siteMeta,
    title: `Site Meta - ${defaultSiteMeta.title}`,
    description: 'Information about this website, its technology stack, and credits.',
    image: ogImages.siteMeta,
  });

  return { siteInfo, error, meta };
};
