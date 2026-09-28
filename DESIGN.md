# DESIGN.md

The visual language of ewancroft.uk: **the almanac**.

The site is a page from a personal almanac. Print conventions supply the structure; the Wheel of the Year supplies the colour and the ornament. The live specimen is at `/site/design`; the stylesheet is `src/styles/almanac.css` (tokens in `src/styles/tokens.css`, long-form reading in `src/styles/prose.css`).

## Principles

- **Paper and ink.** One tinted ground (`--paper`), one ink (`--ink`), one seasonal seal colour (`--stamp`). Solid colour only: no gradients, no shadows, no rounded corners (`--radius-*` are `0`; only `--radius-full` is used, for the seal's dots).
- **Marginalia.** Section labels, roman numerals and metadata live in a left margin set in mono (`.folio > .margin`). Below 56rem the margin folds above the text.
- **Leaders, not cards.** Lists are contents pages (`.toc`): title, dotted leader, date. Actionable rows tint to the seal colour on hover and never move. Grids of works are ruled `.plates` that invert on hover.
- **The calendar is the ornament.** The running head (`.dateline`) reports the date, the moon phase and days to the next sabbat, computed per request in `Europe/London` (`src/lib/utils/almanac.ts`). The seal (`Stamp.astro`) names the current sabbat around tonight's moon and turns once every `--duration-stamp` (90s). On Mondays the dateline says _mōnandæg_.
- **Quiet motion.** Entries fade up once (`.reveal`); pages crossfade via Astro's view transitions. Everything stops under `prefers-reduced-motion`.

## Type

- **Fraunces** (variable: `opsz`, `wght`, `SOFT`, `WONK`) for everything readable. Display sizes are light (weight 250–300, `opsz` 144, tight tracking); italics use `WONK` for their lean. Prose sets at a 66ch measure.
- **JetBrains Mono** for marginalia only: datelines, labels, numerals, metadata. Always small, usually upper-case, always tracked out.
- Scale tokens: `--text-micro` … `--text-4xl`. `--text-3xl` is the page-title ceiling, `--text-4xl` the home nameplate only. One poster-scale focal point per page.

## Colour

The seasonal engine is unchanged. `src/lib/server/theme.ts` generates OKLCH scales interpolated between the previous and next sabbat and injects them per request (`Base.astro`; refreshed hourly by `SeasonalThemeUpdater`). Neutrals are tinted toward the current hue.

- `--paper`/`--paper-deep` = background 50/100, `--ink`/`--ink-soft` = text 950/700, `--rule` = text 300/400.
- `--stamp` is `--color-primary-text`: the accessible text variant of the primary accent. `--color-primary-500` has the same lightness in both schemes (right for fills and rules, ~2.7:1 as text on light paper), so use the `-text` tokens for any plain-text use of the seasonal colour.
- Locale is strictly `en-GB` (HTML `lang`, `og:locale`, date formatting).

## Layout

- `.sheet` (76rem, fluid 16–40px gutters) wraps every page; `.sheet--narrow` for single columns.
- `.folio` is the two-column page (margin left, text right). `.page-head` opens inner pages: mono kicker, light display title with an italic word, italic standfirst.
- The colophon (`Colophon.astro`) replaces the footer: how the site was set, correspondence, imprint, and the wolf-mode and ambiance toggles.

## Interactive islands

Astro renders pages to static HTML; Svelte 5 is used only where interaction earns it (comments, table of contents, share bar, backlinks, Leaflet blocks, the ambient soundscape, Easter eggs). Persistent islands (`AmbianceEngine`, eggs) use `transition:persist` in `Base.astro` so audio survives navigation. Islands that need the current URL read `$app/state`, shimmed in `src/shims/app-state.svelte.ts`.

## Anti-references

- **AI slop**: no generic "boost productivity" copy, no purple gradients, no glassmorphism.
- **Visual noise**: no drop shadows, no cards-on-cards, no motion without purpose.
