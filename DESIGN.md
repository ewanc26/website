# Design

## Visual Theme

Dark-green terminal in a forest clearing. Sharp edges, subtle green glow, monospace accents. Mechanical structure with organic content motion. The site feels like checking a system status panel that happens to live in the woods.

## Color Palette

| Token         | Light                   | Dark         | Role               |
| ------------- | ----------------------- | ------------ | ------------------ |
| `ink-*`       | Slate-tinted (hue 230°) | Slate-tinted | Text               |
| `canvas-*`    | Slate-tinted (hue 230°) | Slate-tinted | Backgrounds        |
| `primary-*`   | Slate (hue 230°)        | Slate        | Primary actions    |
| `secondary-*` | Steel grey (hue 215°)   | Steel grey   | Secondary elements |
| `accent-*`    | Charcoal (hue 240°)     | Charcoal     | Accent highlights  |

12 named colour themes override these tokens: sage, monochrome, ruby, sunset, amber, forest, teal, ocean, lavender, rose, coral, slate. All defined via `light-dark(oklch(...))` for automatic light/dark adaptation.

Browser theme colour: `#10b981` (emerald green). Manifest dark theme: `#0a1607` / `#0f0f0f`.

## Typography

| Role      | Font           | Weight  | Size                         |
| --------- | -------------- | ------- | ---------------------------- |
| Body      | Inter Variable | 400     | 16px base                    |
| Headings  | Inter Variable | 700–900 | 2xl–5xl                      |
| Labels    | Inter Variable | 600     | xs, uppercase, tracking-wide |
| Monospace | JetBrains Mono | 400     | Terminal accents, code       |

Font stack: self-hosted Inter Variable with `ui-sans-serif, system-ui, sans-serif` fallbacks. JetBrains Mono for terminal-themed elements.

## Components

| Component    | Variant                                  | Padding          | Notes                                             |
| ------------ | ---------------------------------------- | ---------------- | ------------------------------------------------- |
| Card         | default, elevated, flat, button, outline | none, sm, md, lg | Rounded-xl, soft shadows. Skeleton loading state. |
| InternalCard | link-style                               | —                | Clickable card for navigation                     |
| LinkCard     | default, button                          | —                | External link card with arrow suffix              |
| Badge        | pill                                     | —                | Status tags, labels                               |
| Tabs         | pill                                     | —                | Year filter in archive                            |
| Dropdown     | select                                   | —                | Publication/tag filter                            |
| SearchBar    | —                                        | —                | Archive search                                    |
| Pagination   | —                                        | —                | Page navigation                                   |

## Layout

- **Shell**: sticky header → centered main → footer
- **Homepage**: masonry 2-column grid (`columns-1 lg:columns-2`), max-w-6xl
- **Archive**: max-w-4xl, search + filters + year tabs + grouped document list
- **Work**: max-w-6xl, sectioned layout with card grids
- **Site/Meta**: max-w-5xl, sectioned with rounded-xl cards

Spacing is utility-driven (Tailwind defaults). Common: `p-4/6/8`, `gap-2/3/4/6/8`, `space-y-2/4/6/8`.

## Motion

- **Structure** (cards, navigation, layout): precise, mechanical. `ease-out-expo` easing. Terminal cursor energy.
- **Content** (status changes, text reveals, data updates): soft, natural. `ease-out-quart` easing. Forest calm.
- **Entrances**: staggered fade-slide-up on page load, 80ms stagger between cards
- **State changes**: 200–300ms transitions on colour, opacity, transform
- **Live updates**: brief green pulse on card border when firehose data changes
- **Reduced motion**: all durations collapse to 0.01ms, iteration count 1

## Iconography

Lucide icons throughout. `h-4 w-4` for inline, `h-5 w-5` for navigation, `h-8 w-8` for hero sections. Green accent (`text-primary-600 dark:text-primary-400`).

## Borders & Radius

- Outer cards: `rounded-xl`
- Inner elements: `rounded-lg`
- Pills/badges: `rounded-full`
- No rounded corners on terminal-themed elements (sharp edges where appropriate)
