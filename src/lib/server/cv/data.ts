/**
 * CV data aggregation — pulls the same AT Protocol records the about page
 * reads (SIFA profile, skills, education, languages, external accounts,
 * projects) and shapes them into a CV-oriented structure, blended with
 * tailored constants for the things that don't exist as records
 * (summary, methodology, selected infrastructure, experience).
 */

import {
  fetchProfile,
  fetchSifaProfile,
  fetchSifaSkills,
  fetchSifaEducation,
  fetchSifaLanguages,
  fetchSifaExternalAccounts,
  fetchSifaProjects,
  fetchAllRecords,
} from "@ewanc26/atproto";
import type {
  ProfileData,
  SifaSkill,
  SifaEducation,
  SifaLanguage,
  SifaExternalAccount,
  SifaProject,
} from "@ewanc26/atproto";

export interface CvSkillGroup {
  category: string;
  skills: string[];
}

export interface CvEducation {
  qualification: string;
  institution: string;
  field: string;
  grade?: string;
  startedAt?: string;
  endedAt?: string;
  description?: string;
}

export interface CvLanguage {
  name: string;
  proficiency: string;
}

export interface CvLink {
  label: string;
  url: string;
}

export interface CvProject {
  name: string;
  description?: string;
  url?: string;
  startedAt?: string;
  endedAt?: string;
}

export interface CvData {
  name: string;
  headline: string;
  location: string;
  summary: string;
  methodology: string[];
  skillGroups: CvSkillGroup[];
  selectedProjects: { name: string; stack: string; description: string }[];
  recordProjects: CvProject[];
  experience: {
    title: string;
    org: string;
    period: string;
    points: string[];
  }[];
  education: CvEducation[];
  languages: CvLanguage[];
  links: CvLink[];
  generatedAt: string;
}

const SKILL_CATEGORY_LABELS: Record<string, string> = {
  "id.sifa.defs#technical": "Technical",
  "id.sifa.defs#creative": "Creative",
  "id.sifa.defs#industry": "Industry",
  "id.sifa.defs#soft": "Soft Skills",
};

const LANGUAGE_PROFICIENCY_LABELS: Record<string, string> = {
  "id.sifa.defs#native": "Native",
  "id.sifa.defs#fluent": "Fluent",
  "id.sifa.defs#limitedWorking": "Limited working",
  "id.sifa.defs#elementary": "Elementary",
};

/** Tailored constants — CV-specific framing that has no AT Protocol record. */
const SUMMARY =
  "Systems and software engineer with five years of self-directed open-source development, maintaining 47 public repositories spanning TypeScript/Svelte monorepos, low-level protocol SDKs, and cross-platform plugin systems — most built around custom AT Protocol client and server implementations. Comfortable end-to-end but backend-leaning: designs and ships production infrastructure including a live, custom-built Personal Data Server, a declarative multi-host NixOS estate, and a 16-package TypeScript monorepo with automated publishing.";

const METHODOLOGY = [
  "Core systems are hand-written: TypeScript, Svelte/SvelteKit, Python, HTML/CSS, and Tailwind are written directly, with full ownership of architecture, data modelling, and implementation.",
  "For lower-level or less-familiar languages — C23/C++23, Rust, Java/Kotlin, and Swift — an AI-augmented workflow accelerates implementation. Architecture, data structures, schema and protocol design, debugging strategy, build configuration, and system operations are done independently; AI tooling is an execution accelerant, not a design source.",
];

const SELECTED_PROJECTS = [
  {
    name: "MetalBear & Wolfram",
    stack: "C23/C++23 · CMake · SQLite · live alpha deployment",
    description:
      "A custom, lightweight AT Protocol Personal Data Server (v0.25.1, AGPL-3.0-only) running as a live development/alpha instance, designed for a minimal resource and embedded-friendly footprint. Backed by libwolfram, a custom C23/C++23 protocol SDK handling XRPC/WebSocket transport, DID and handle resolution, repo DAG-CBOR/CAR/MST layers, OAuth (DPoP, PAR) flows, and firehose/Jetstream sync, with SQLite-backed persistence and per-route rate limiting — unit tested with CMake and CTest.",
  },
  {
    name: "@ewanc26/pkgs",
    stack: "TypeScript · Svelte · Rust · Python · pnpm/Cargo/Nix monorepo",
    description:
      "16-package monorepo with automated publishing tooling, covering AT Protocol service layers, TID generation, Svelte UI components, noise-avatar generation, and the Malachite/Bismuth tooling suite, plus supporting Rust config utilities and Python analysis scripts. Documentation published and kept current at docs.ewancroft.uk.",
  },
  {
    name: "NixOS Infrastructure",
    stack: "Nix · nix-darwin · Home Manager · Caddy",
    description:
      "Multi-host NixOS/nix-darwin flake across a Mac Mini, a Dell laptop, and a headless server, using Home Manager and sops-nix for encrypted secrets. Self-hosted and production services (Forgejo, Nextcloud, Immich, Jellyfin, an AT Protocol PDS) behind Caddy with automated ACME DNS-01 certificates; auto-generated nix-topology diagrams and Rust-based maintenance tooling.",
  },
  {
    name: "esoterica",
    stack: "Rust · WebAssembly · Svelte 5",
    description:
      "Constructed-language generator producing phonology, morphology, sound changes, and procedural orthography. Shipped as both a Ratatui terminal UI and a Svelte 5 web UI compiled to WebAssembly, with collaborative publishing over the AT Protocol.",
  },
  {
    name: "socialsync",
    stack: "Kotlin · PaperMC · Ktor",
    description:
      "PaperMC plugin linking Minecraft player UUIDs to AT Protocol identities, mirroring achievements, session records, and stat summaries to each player Bluesky feed. Shaded its own AT Protocol runtime into the plugin, removing the need for a companion dependency.",
  },
  {
    name: "Inkwell",
    stack: "Swift (iOS) · Kotlin (Android)",
    description:
      "Native AT Protocol client for Standard.site and Leaflet publications — SwiftUI on iOS, Kotlin on Android — covering content rendering, subscribe/recommend flows, and OAuth session persistence. First self-taught mobile project.",
  },
];

const EXPERIENCE = [
  {
    title: "Independent Open-Source Developer",
    org: "Self-directed",
    period: "2021 – present",
    points: [
      "Design, build, and operate production and self-hosted systems spanning protocol SDKs, monorepo tooling, and declarative infrastructure.",
      "Author regular long-form technical and analytical articles on decentralised protocols and system infrastructure at blog.ewancroft.uk.",
    ],
  },
  {
    title: "Dog Sitter",
    org: "Rivernharg German Shorthaired Pointers",
    period: "2020 – present",
    points: [
      "Provide reliable ad-hoc care, feeding, and direct supervision for a local small dog-breeding business.",
    ],
  },
];

function groupSkills(skills: SifaSkill[]): CvSkillGroup[] {
  const grouped = new Map<string, string[]>();
  for (const skill of skills) {
    const cat =
      SKILL_CATEGORY_LABELS[skill.category] ??
      skill.category.split("#")[1] ??
      "Other";
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(skill.name);
  }
  return [...grouped.entries()].map(([category, names]) => ({
    category,
    skills: names,
  }));
}

function mapEducation(records: SifaEducation[]): CvEducation[] {
  return records
    .map((record) => ({
      qualification:
        (record as any).qualification ?? record.degree ?? "Qualification",
      institution: record.institution,
      field: (record as any).field ?? record.fieldOfStudy ?? "",
      grade: record.grade,
      startedAt: record.startedAt,
      endedAt: record.endedAt,
      description: record.description,
    }))
    .sort((a, b) => (b.startedAt ?? "").localeCompare(a.startedAt ?? ""));
}

function mapLanguages(records: SifaLanguage[]): CvLanguage[] {
  return records.map((record) => ({
    name: record.name,
    proficiency:
      LANGUAGE_PROFICIENCY_LABELS[record.proficiency] ??
      record.proficiency.split("#")[1] ??
      record.proficiency,
  }));
}

function mapLinks(records: SifaExternalAccount[]): CvLink[] {
  return records
    .filter((record) => record.label && record.url)
    .map((record) => ({ label: record.label!, url: record.url }));
}

function mapRecordProjects(records: SifaProject[]): CvProject[] {
  return records
    .filter((record) => record.name && record.description)
    .map((record) => ({
      name: record.name,
      description: record.description,
      url: record.url,
      startedAt: record.startedAt,
      endedAt: (record as any).endedAt,
    }))
    .sort((a, b) => (b.startedAt ?? "").localeCompare(a.startedAt ?? ""));
}

const COUNTRY_NAMES: Record<string, string> = {
  GB: "United Kingdom",
  US: "United States",
  CA: "Canada",
  AU: "Australia",
  IE: "Ireland",
  FR: "France",
  DE: "Germany",
  NL: "Netherlands",
  ES: "Spain",
  IT: "Italy",
  NZ: "New Zealand",
};

/**
 * Derive a readable location string from the primary
 * `id.sifa.profile.location` record. Renders only what the record
 * carries — city, region, country — no hardcoded values.
 */
async function fetchLocation(
  did: string,
  fetchFn?: typeof fetch,
): Promise<string> {
  try {
    const records = await fetchAllRecords<{
      address?: { countryCode?: string; region?: string; city?: string };
      isPrimary?: boolean;
    }>({
      repo: did,
      collection: "id.sifa.profile.location",
      limit: 10,
      fetchFn,
    });
    const primary =
      records.find((r) => r.value?.isPrimary)?.value ?? records[0]?.value;
    if (!primary?.address) return "";
    const { city, region, countryCode } = primary.address;
    const parts = [city, region].filter(Boolean) as string[];
    const country = countryCode
      ? (COUNTRY_NAMES[countryCode] ?? countryCode)
      : undefined;
    if (country && !parts.includes(country)) parts.push(country);
    return parts.join(", ");
  } catch {
    return "";
  }
}

/**
 * Aggregate all CV data. Every fetch degrades independently — a dead PDS
 * yields empty sections rather than a broken script.
 */
export async function gatherCvData(
  did: string,
  fetchFn?: typeof fetch,
): Promise<CvData> {
  const [
    profile,
    sifaProfile,
    skills,
    education,
    languages,
    links,
    projects,
    location,
  ] = await Promise.all([
    fetchProfile(did, fetchFn).catch(() => null as ProfileData | null),
    fetchSifaProfile(did, fetchFn).catch(() => null),
    fetchSifaSkills(did, fetchFn).catch(() => [] as SifaSkill[]),
    fetchSifaEducation(did, fetchFn).catch(() => [] as SifaEducation[]),
    fetchSifaLanguages(did, fetchFn).catch(() => [] as SifaLanguage[]),
    fetchSifaExternalAccounts(did, fetchFn).catch(
      () => [] as SifaExternalAccount[],
    ),
    fetchSifaProjects(did, fetchFn).catch(() => [] as SifaProject[]),
    fetchLocation(did, fetchFn),
  ]);

  return {
    name: profile?.displayName ?? sifaProfile?.headline ?? "Ewan Croft",
    headline: sifaProfile?.headline ?? "Software developer and hobbyist poet",
    location,
    summary: SUMMARY,
    methodology: METHODOLOGY,
    skillGroups: groupSkills(skills),
    selectedProjects: SELECTED_PROJECTS,
    recordProjects: mapRecordProjects(projects),
    experience: EXPERIENCE,
    education: mapEducation(education),
    languages: mapLanguages(languages),
    links: mapLinks(links),
    generatedAt: new Date().toISOString().slice(0, 10),
  };
}
