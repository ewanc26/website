# @ewanc26/utils

> **Canonical source:** This package is now maintained in the [`@ewanc26/pkgs`](https://github.com/ewanc26/pkgs) monorepo under [`packages/utils`](https://github.com/ewanc26/pkgs/tree/main/packages/utils). This copy exists for historical context — please open issues and PRs there.

Shared utility functions extracted from [ewancroft.uk](https://ewancroft.uk). Zero runtime dependencies.

## Modules

- **Date & Locale** — `formatRelativeTime`, `formatLocalizedDate`, `getUserLocale`
- **Number Formatting** — `formatCompactNumber`, `formatNumber`
- **URL Utilities** — `getDomain`, `atUriToBlueskyUrl`, `getBlueskyProfileUrl`, `isExternalUrl`
- **Validators & Text** — `isValidTid`, `isValidDid`, `truncateText`, `escapeHtml`, `getInitials`, `debounce`, `throttle`
- **RSS Generation** — `generateRSSFeed`, `generateRSSItem`, `createRSSResponse`, `escapeXml`, `normalizeCharacters`, `formatRSSDate`

## Installation

```bash
pnpm add @ewanc26/utils
```

## Quick Examples

```typescript
import { formatRelativeTime, formatCompactNumber, getDomain, isValidDid, generateRSSFeed } from '@ewanc26/utils';

formatRelativeTime('2025-11-13T00:00:00Z'); // '3d ago'
formatCompactNumber(1500);                   // '1.5K'
getDomain('https://www.example.com/path');   // 'example.com'
isValidDid('did:plc:abc123');                // true

const xml = generateRSSFeed({ title: 'My Blog', link: 'https://mysite.com', description: '…' }, items);
```

All functions are SSR-safe and fall back to `en-GB` when `navigator` / `window` are unavailable.

## Build

Development happens in the [`@ewanc26/pkgs`](https://github.com/ewanc26/pkgs) monorepo. Local commands (from `packages/utils`):

```bash
pnpm build   # tsc
pnpm dev     # tsc --watch
pnpm check   # tsc --noEmit
```

## Licence

AGPL-3.0-only — see the [pkgs monorepo licence](https://github.com/ewanc26/pkgs/blob/main/LICENSE).
