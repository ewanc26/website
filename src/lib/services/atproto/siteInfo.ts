export interface SiteInfoLink {
  name?: string;
  url?: string;
}

export interface SiteInfoCredit extends SiteInfoLink {
  type: string;
  author?: string;
  section?: string;
  description?: string;
  license?: SiteInfoLink;
}

export interface SiteInfoTechnology extends SiteInfoLink {
  name: string;
  description?: string;
  section?: string;
}

export interface SiteInfoRepository {
  url: string;
  type?: string;
  platform?: string;
  description?: string;
}

export interface SiteInfoRelatedService extends SiteInfoLink {
  name: string;
  section?: string;
  relationship?: string;
  description?: string;
}

export interface NormalizedSiteInfo {
  credits: SiteInfoCredit[];
  technologyStack: SiteInfoTechnology[];
  privacyStatement?: string;
  openSourceInfo?: {
    description?: string;
    license?: SiteInfoLink;
    repositories: SiteInfoRepository[];
    relatedServices: SiteInfoRelatedService[];
  };
  additionalInfo?: {
    purpose?: string;
    websiteBirthYear?: number;
    sectionLicense: Array<SiteInfoLink & { section?: string }>;
    analytics?: {
      services: string[];
      cookiePolicy?: string;
    };
    deployment?: {
      platform?: string;
      cdn?: string;
      customDomain?: boolean;
    };
    contact?: {
      email?: string;
      social: Array<{ platform: string; url: string; handle?: string }>;
    };
  };
}

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : undefined;
}

function text(value: unknown, maxLength = 5000): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

function webUrl(value: unknown): string | undefined {
  const raw = text(value, 2048);
  if (!raw) return undefined;

  try {
    const url = new URL(raw);
    return url.protocol === "https:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function email(value: unknown): string | undefined {
  const candidate = text(value, 254);
  return candidate && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate)
    ? candidate
    : undefined;
}

function link(value: unknown): SiteInfoLink | undefined {
  const item = record(value);
  if (!item) return undefined;
  const normalized = { name: text(item.name, 1000), url: webUrl(item.url) };
  return normalized.name || normalized.url ? normalized : undefined;
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Treat the repository record as untrusted input and expose one stable shape to
 * Svelte components. The compatibility lookup for `additionalInfo.properties`
 * supports records created from the original draft schema as well as the
 * flattened shape used by @ewanc26/atproto's public type.
 */
export function normalizeSiteInfo(value: unknown): NormalizedSiteInfo | null {
  const input = record(value);
  if (!input) return null;

  const additional = record(input.additionalInfo);
  const legacyProperties = record(additional?.properties);
  const property = (name: string) =>
    additional?.[name] ?? legacyProperties?.[name];

  const credits = list(input.credits)
    .flatMap((value): SiteInfoCredit[] => {
      const item = record(value);
      const name = text(item?.name, 1000);
      if (!item || !name) return [];

      return [
        {
          name,
          type: text(item.type, 500) ?? "resource",
          url: webUrl(item.url),
          author: text(item.author, 1000),
          section: text(item.section, 1000),
          description: text(item.description),
          license: link(item.license),
        },
      ];
    })
    .slice(0, 50);

  const technologyStack = list(input.technologyStack)
    .flatMap((value): SiteInfoTechnology[] => {
      const item = record(value);
      const name = text(item?.name, 1000);
      if (!item || !name) return [];
      return [
        {
          name,
          url: webUrl(item.url),
          description: text(item.description),
          section: text(item.section, 1000),
        },
      ];
    })
    .slice(0, 50);

  const openSource = record(input.openSourceInfo);
  const repositories = list(openSource?.repositories)
    .flatMap((value): SiteInfoRepository[] => {
      const item = record(value);
      const url = webUrl(item?.url);
      if (!item || !url) return [];
      return [
        {
          url,
          type: text(item.type, 500),
          platform: text(item.platform, 500),
          description: text(item.description, 2000),
        },
      ];
    })
    .slice(0, 20);

  const relatedServices = list(openSource?.relatedServices)
    .flatMap((value): SiteInfoRelatedService[] => {
      const item = record(value);
      const name = text(item?.name, 1000);
      if (!item || !name) return [];
      return [
        {
          name,
          url: webUrl(item.url),
          section: text(item.section, 1000),
          relationship: text(item.relationship, 1000),
          description: text(item.description),
        },
      ];
    })
    .slice(0, 20);

  const sectionLicense = list(property("sectionLicense"))
    .flatMap((value): Array<SiteInfoLink & { section?: string }> => {
      const item = record(value);
      if (!item) return [];
      const normalized = {
        name: text(item.name, 1000),
        url: webUrl(item.url),
        section: text(item.section, 1000),
      };
      return normalized.name || normalized.url ? [normalized] : [];
    })
    .slice(0, 20);

  const analytics = record(additional?.analytics);
  const deployment = record(additional?.deployment);
  const contact = record(additional?.contact);
  const social = list(contact?.social)
    .flatMap(
      (value): Array<{ platform: string; url: string; handle?: string }> => {
        const item = record(value);
        const platform = text(item?.platform, 500);
        const url = webUrl(item?.url);
        return item && platform && url
          ? [{ platform, url, handle: text(item.handle, 1000) }]
          : [];
      },
    )
    .slice(0, 20);

  const yearValue = property("websiteBirthYear");
  const websiteBirthYear =
    typeof yearValue === "number" &&
    Number.isInteger(yearValue) &&
    yearValue >= 1990 &&
    yearValue <= new Date().getFullYear() + 1
      ? yearValue
      : undefined;

  return {
    credits,
    technologyStack,
    privacyStatement: text(input.privacyStatement, 50000),
    openSourceInfo: openSource
      ? {
          description: text(openSource.description, 20000),
          license: link(openSource.license),
          repositories,
          relatedServices,
        }
      : undefined,
    additionalInfo: additional
      ? {
          purpose: text(property("purpose"), 10000),
          websiteBirthYear,
          sectionLicense,
          analytics: analytics
            ? {
                services: list(analytics.services)
                  .flatMap((service) => text(service, 1000) ?? [])
                  .slice(0, 10),
                cookiePolicy: text(analytics.cookiePolicy, 10000),
              }
            : undefined,
          deployment: deployment
            ? {
                platform: text(deployment.platform, 1000),
                cdn: text(deployment.cdn, 1000),
                customDomain:
                  typeof deployment.customDomain === "boolean"
                    ? deployment.customDomain
                    : undefined,
              }
            : undefined,
          contact: contact
            ? {
                email: email(contact.email),
                social,
              }
            : undefined,
        }
      : undefined,
  };
}
