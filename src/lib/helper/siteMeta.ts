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

export const siteMeta: SiteMetadata = {
  title: "Ewan's Corner",
  description: "Welcome to Ewan's Corner - A personal space where I share my thoughts on coding, technology, and life.",
  keywords: "Ewan, personal website, coding, technology, programming, tech blog, Ewan's Corner",
  url: '', // set dynamically
  image: ogImages.main,
  imageWidth: 1200,
  imageHeight: 630
};

// Note: The `url` field will be set dynamically in the layout file based on the current page URL.