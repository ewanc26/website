# @ewanc26/ui

> **Canonical source:** This package is now maintained in the [`@ewanc26/pkgs`](https://github.com/ewanc26/pkgs) monorepo under [`packages/ui`](https://github.com/ewanc26/pkgs/tree/main/packages/ui). This copy exists for historical context — please open issues and PRs there.

Svelte UI component library extracted from [ewancroft.uk](https://ewancroft.uk). Provides layout and card components, UI primitives, SEO helpers, Svelte stores, post utilities, and a multi-theme configuration system.

## Installation

```bash
pnpm add @ewanc26/ui
```

Peer dependencies: `svelte >= 5`, `@sveltejs/kit >= 2`, `tailwindcss >= 4`. Optional: `@ewanc26/atproto` (for AT Protocol card components).

## What's Exported

### Components

| Group | Components |
|-------|------------|
| Layout toggles | `ThemeToggle`, `WolfToggle` |
| Layout main | `DynamicLinks`, `ScrollToTop` |
| Cards | `ProfileCard`, `PostCard`, `BlueskyPostCard`, `LinkCard`, `MusicStatusCard`, `KibunStatusCard`, `TangledRepoCard` |
| UI primitives | `Card`, `InternalCard`, `Dropdown`, `Pagination`, `SearchBar`, `Tabs`, `PostsGroupedView`, `DocumentCard`, `BlogPostCard` |
| SEO | `MetaTags` |

### Stores

| Store | Type | Description |
|-------|------|-------------|
| `wolfMode` | `Writable<boolean>` | Wolf mode text transformation |
| `colorTheme` | `Writable<ColorTheme>` | Active colour theme |
| `colorThemeDropdownOpen` | `Writable<boolean>` | Theme picker open state |
| `happyMacStore` | `Writable<boolean>` | Happy Mac easter egg |

### Theme Configuration

12 themes across four categories (neutral, warm, cool, vibrant) using OKLCH colour values. Default: `slate`.

```typescript
import { THEMES, DEFAULT_THEME, getTheme, getThemesByCategory, CATEGORY_LABELS } from '@ewanc26/ui';
```

### Helpers

```typescript
import { getPostBadges, getBadgeClasses } from '@ewanc26/ui';
import { filterPosts, groupPostsByDate, getSortedMonths, getSortedYears, getAllTags } from '@ewanc26/ui';
```

### Types

```typescript
import type { SiteMetadata, NavItem, ColorTheme, ThemeDefinition, PostBadge, MonthData, GroupedPosts } from '@ewanc26/ui';
```

## Build

Development happens in the [`@ewanc26/pkgs`](https://github.com/ewanc26/pkgs) monorepo. Local commands (from `packages/ui`):

```bash
pnpm build   # svelte-package
pnpm dev     # svelte-package --watch
pnpm check   # svelte-check
```

## Licence

AGPL-3.0-only — see the [pkgs monorepo licence](https://github.com/ewanc26/pkgs/blob/main/LICENSE).
