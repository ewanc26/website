import { ogImages } from '$lib/helper/ogImages';

export interface SiteMetadata {
  title: string;
  description: string;
  keywords: string;
  url: string;
  image: string;
  imageWidth?: number;
  imageHeight?: number;
}

/**
 * Default metadata that applies site-wide.
 * Can be overridden dynamically for each page or component.
 */
export const defaultSiteMeta: SiteMetadata = {
  title: "Ewan's Corner",
  description: "A personal space where I share my thoughts on coding, technology, and life.",
  keywords: "Ewan, personal website, coding, technology, programming, tech blog, Ewan's Corner",
  url: '',
  image: ogImages.main,
  imageWidth: 1200,
  imageHeight: 630
};

/**
 * Utility function to generate flexible metadata objects.
 * Merges defaults with any overrides provided.
 */
export function createSiteMeta(overrides: Partial<SiteMetadata> = {}): SiteMetadata {
  return {
    ...defaultSiteMeta,
    ...overrides
  };
}
