export interface Profile {
  avatar: string;
  banner: string;
  displayName: string;
  did: string;
  handle: string;
  description: string;
  pds: string;
}

export interface ProfessionalInfo {
  displayName?: string;
  description?: string;
  avatar?: {
    image: {
      $type: string;
      ref: {
        $link: string;
      };
      mimeType: string;
      size: number;
    };
    alt: string;
    aspectRatio?: { width: number; height: number };
  };
  headline?: string;
  websiteUrl?: string;
  contactEmail?: string;
  country?: string;
  skills?: string[];
}

export interface SiteInfo {
  technologyStack?: Array<{ name: string; url?: string; description?: string }>;
  privacyStatement?: string;
  openSourceInfo?: {
    description?: string;
    license?: { name?: string; url?: string };
    basedOn?: Array<{ name: string; url?: string; description?: string; type?: string }>;
    relatedServices?: Array<{ name: string; url?: string; description?: string; relationship?: string }>;
    repositories?: Array<{ platform?: string; url: string; type?: string; description?: string }>;
  };
  credits?: Array<{
    name: string;
    type: string;
    url?: string;
    author?: string;
    license?: { name?: string; url?: string };
    description?: string;
  }>;
  additionalInfo?: {
    purpose?: string;
    websiteBirthYear?: number;
    sectionLicense?: Array<{ section?: string; name?: string; url?: string }>;
    contact?: { email?: string; social?: Array<{ platform: string; url: string; handle?: string }> };
    analytics?: { services?: string[]; cookiePolicy?: string };
    deployment?: { platform?: string; cdn?: string; customDomain?: boolean };
  };
}