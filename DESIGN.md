# DESIGN.md

The visual language of ewancroft.uk.

Not a documentation site, not a portfolio template. This is a two-ink risograph zine crossed with a game cartridge shelf. The live specimen is at `/site`; the stylesheet is `src/styles/riso.css` (tokens in `src/styles/tokens.css`, long-form reading in `src/styles/prose.css`).

## Principles

- **Two inks, one black.** Everything on the page is those three colours (plus paper), overprinted with `mix-blend-mode: multiply` (screen at night) so overlaps make a third colour. The two inks (`--riso-a`, `--riso-b`) are generated in OKLCH from the site's seasonal hue — one direct, one ~150° round the wheel — so the palette still turns with the Wheel of the Year (`src/lib/server/theme.ts`). No gradients except the halftone dot screen, which is what a real riso press makes.
- **Cut, not rounded.** Every corner is square (`--radius-*: 0`). Circles exist only for the moon, the deliberately punched "cartridge" corner-notch on project tiles, and the icon and count punches on list rows. Text chips (tags, skills, pronouns) are cut square.
- **Colossal or pixel.** Section headings (`.slab`, `.word`) print at poster scale, cropped by the sheet, doubled in the second ink a hair out of register. Everything small — labels, metadata, buttons, nav — is Pixelify Sans, styled like a game's HUD.
- **Nothing floats.** No cards with shadows. Panels (`.cart`, `.idcard`, `.nametag`) sit flat on the page and are told apart by ink, rule weight and a few degrees of rotation, not elevation.
- **Stepped motion.** Entrances use `steps()` easing (`.thunk`, `--ease-step`), like a print run advancing a frame at a time, not the eased motion of an app. Everything stops under `prefers-reduced-motion`.

## Type

- **Archivo** (variable, width axis pushed to ~110–125) carries every headline and the nav. Weight 900, tight negative tracking, always uppercase in the big slabs.
- **Atkinson Hyperlegible Next** — designed for legibility over looks — carries body prose.
- **Pixelify Sans** is the game-UI voice: nav labels, tags, buttons, metadata, the ID card and cartridge lettering.
- **JetBrains Mono** is reserved for code.

## Colour

`src/lib/server/theme.ts`'s `getDynamicThemeCSS()` still runs the seasonal engine; it now emits `--riso-a`/`--riso-b` alongside the old token scales, refreshed hourly by `SeasonalThemeUpdater` and recomputed per request in `+layout.server.ts`. `--blend` is `multiply` on newsprint by day and `screen` on black stock by night (`prefers-color-scheme`), so overprints always read as ink on the medium beneath them, not as a flat colour.

Text-bearing inks have their lightness solved per hue in `src/lib/utils/contrast.ts`: at least 4.5:1 for accent text and filled controls, 3:1 for the second plate's display words. Night-mode text is solved against true WCAG luminance; the daytime and fill solvers use a stricter measure that the palette is tuned to. `contrast.test.ts` sweeps the whole wheel.

Data graphics print in the inks too: the commit calendar is a coverage ramp of the second plate. Language swatches keep their conventional colours, which identify the language.

## Layout

- `.wrap` (82rem, fluid gutters) wraps every page.
- **The spine** (`Header.svelte`) is a solid ink strip down the left edge on desktop (nav set vertically) and a bar pinned to the bottom on phones (two shallower rows, 3rem each) — no hamburger menu. Its desktop type and padding scale with window height so every link stays on screen.
- **The press** (`Colophon.svelte`) replaces a conventional footer: colophon, correspondence, small print, a calibration colour bar, and the eight moon phases with tonight's lit.
- Section layout is `.cols`: a sticky word-mark heading on the left, content on the right.
- A post's contents list sits in a scrollable sticky rail beside the article, and folds closed on narrower screens. The section being read is marked in the first ink.
- Posts end with the older and newer entries as two ruled boxes. The blog archive shows the eight busiest topics, with the rest behind a dashed "more" chip; a pressed topic filters by tag and prints solid.

## Interactive islands

SvelteKit server-renders every page; Svelte components (comments, table of contents, share bar, backlinks, the ambient soundscape, Easter eggs) drive the interactive parts with real reactive state, and native `<dialog>` still handles modals. Persistent widgets mount once in the root layout (`+layout.svelte`), which doesn't remount across client-side navigation, so audio and eggs survive navigation without needing anything like Astro's `transition:persist`.

## Anti-references

- **AI slop**: no generic "boost productivity" copy, no purple gradients, no glassmorphism, no centred hero with a subtitle and two buttons.
- **Visual noise for its own sake**: no drop shadows, no soft blur, no motion without a reason tied to the print-shop conceit.
