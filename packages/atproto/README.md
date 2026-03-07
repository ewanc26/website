# @ewanc26/atproto

> **Canonical source:** This package is now maintained in the [`@ewanc26/pkgs`](https://github.com/ewanc26/pkgs) monorepo under [`packages/atproto`](https://github.com/ewanc26/pkgs/tree/main/packages/atproto). This copy exists for historical context — please open issues and PRs there.

AT Protocol service layer extracted from [ewancroft.uk](https://ewancroft.uk). Handles identity resolution, record fetching, Bluesky posts, Standard.site documents, music/mood status, and more — with a built-in in-memory cache.

**Key difference from the app's internal service layer:** all functions accept `did: string` as their first argument rather than reading `PUBLIC_ATPROTO_DID` from the environment.

## Installation

```bash
pnpm add @ewanc26/atproto
```

Requires `@atproto/api >= 0.13.0` as a peer dependency.

## What's Exported

### Fetch Functions

| Function | Description |
|----------|-------------|
| `fetchProfile(did)` | Bluesky profile including pronouns |
| `fetchSiteInfo(did)` | `uk.ewancroft.site.info` record |
| `fetchLinks(did)` | `blue.linkat.board` link cards |
| `fetchMusicStatus(did)` | teal.fm music status with cascading artwork lookup |
| `fetchKibunStatus(did)` | kibun.social mood status |
| `fetchTangledRepos(did)` | Tangled code repositories |
| `fetchPublications(did)` | Standard.site publications |
| `fetchDocuments(did, pubRkey)` | Standard.site documents for a publication |
| `fetchBlogPosts(did, pubRkey)` | Blog posts for a publication |
| `fetchRecentDocuments(did, limit)` | Most recent documents across all publications |
| `fetchLatestBlueskyPost(did)` | Latest non-reply Bluesky post with thread context |
| `fetchPostFromUri(did, uri)` | Single Bluesky post by AT URI |
| `fetchAllEngagement(uris)` | Like/repost counts via Constellation API |

### Agents & Identity

```typescript
import { resolveIdentity, getPublicAgent, getPDSAgent, createAgent, withFallback, resetAgents } from '@ewanc26/atproto';
```

### Pagination

```typescript
import { fetchAllRecords, fetchAllUserRecords } from '@ewanc26/atproto';
```

### Cache

```typescript
import { cache, ATProtoCache, CACHE_TTL } from '@ewanc26/atproto';

cache.clear();
cache.delete('profile:did:plc:…');
```

### Music Artwork

```typescript
import { findArtwork, searchMusicBrainzRelease, buildCoverArtUrl } from '@ewanc26/atproto';
// Cascading: MusicBrainz → iTunes → Deezer → Last.fm → PDS blob
```

### Media

```typescript
import { buildPdsBlobUrl, extractCidFromImageObject, extractImageUrlsFromValue } from '@ewanc26/atproto';
```

### Types

All interfaces (`ProfileData`, `BlueskyPost`, `BlogPost`, `MusicStatusData`, `KibunStatusData`, `TangledRepo`, `StandardSiteDocument`, `StandardSitePublication`, `SiteInfoData`, `LinkData`, `ResolvedIdentity`, …) are exported from the package root.

## Build

Development happens in the [`@ewanc26/pkgs`](https://github.com/ewanc26/pkgs) monorepo. Local commands (from `packages/atproto`):

```bash
pnpm build   # tsc
pnpm dev     # tsc --watch
pnpm check   # tsc --noEmit
```

## Licence

AGPL-3.0-only — see the [pkgs monorepo licence](https://github.com/ewanc26/pkgs/blob/main/LICENSE).
