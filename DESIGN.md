# DESIGN.md

The visual language of ewancroft.uk.

Not a documentation site, not a portfolio template. This is a two-ink risograph zine crossed with a game cartridge shelf. The live specimen is at `/site/design`; the stylesheet is `src/styles/riso.css` (tokens in `src/styles/tokens.css`, long-form reading in `src/styles/prose.css`).

## Principles

- **Two inks, one black.** Everything on the page is those three colours (plus paper), overprinted with `mix-blend-mode: multiply` (screen at night) so overlaps make a third colour. The two inks (`--riso-a`, `--riso-b`) are generated in OKLCH from the site's seasonal hue — one direct, one ~150° round the wheel — so the palette still turns with the Wheel of the Year (`src/lib/server/theme.ts`). No gradients except the halftone dot screen, which is what a real riso press makes.
- **Cut, not rounded.** Every corner is square (`--radius-*: 0`). Circles exist only for the moon and the deliberately punched "cartridge" corner-notch on project tiles.
- **Colossal or pixel.** Section headings (`.slab`, `.word`) print at poster scale, cropped by the sheet, doubled in the second ink a hair out of register. Everything small — labels, metadata, buttons, nav — is Pixelify Sans, styled like a game's HUD.
- **Nothing floats.** No cards with shadows. Panels (`.cart`, `.idcard`, `.nametag`) sit flat on the page and are told apart by ink, rule weight and a few degrees of rotation, not elevation.
- **Stepped motion.** Entrances use `steps()` easing (`.thunk`, `--ease-step`), like a print run advancing a frame at a time, not the eased motion of an app. Everything stops under `prefers-reduced-motion`.

## Type

- **Archivo** (variable, width axis pushed to ~110–125) carries every headline and the nav. Weight 900, tight negative tracking, always uppercase in the big slabs.
- **Atkinson Hyperlegible Next** — designed for legibility over looks — carries body prose.
- **Pixelify Sans** is the game-UI voice: nav labels, tags, buttons, metadata, the ID card and cartridge lettering.
- **JetBrains Mono** is reserved for code.

## Colour

`src/lib/server/theme.ts`'s `getDynamicThemeCSS()` still runs the seasonal engine; it now emits `--riso-a`/`--riso-b` alongside the old token scales, refreshed hourly by `SeasonalThemeUpdater` and recomputed per request in `Base.astro`. `--blend` is `multiply` on newsprint by day and `screen` on black stock by night (`prefers-color-scheme`), so overprints always read as ink on the medium beneath them, not as a flat colour.

## Layout

- `.wrap` (82rem, fluid gutters) wraps every page.
- **The spine** (`Header.astro`) is a solid ink strip down the left edge on desktop (nav set vertically) and a bar pinned to the bottom on phones — no hamburger menu.
- **The press** (`Colophon.astro`) replaces a conventional footer: colophon, correspondence, small print, a calibration colour bar, and the eight moon phases with tonight's lit.
- Section layout is `.cols`: a sticky word-mark heading on the left, content on the right.

## Interactive islands

Astro renders every page to static HTML; plain `<script>`s and native `<dialog>` handle the few interactive parts (comments, table of contents, share bar, backlinks, Leaflet blocks, the ambient soundscape, Easter eggs); there is no framework. Persistent elements use `transition:persist` in `Base.astro` so audio and eggs survive navigation.

## Anti-references

- **AI slop**: no generic "boost productivity" copy, no purple gradients, no glassmorphism, no centred hero with a subtitle and two buttons.
- **Visual noise for its own sake**: no drop shadows, no soft blur, no motion without a reason tied to the print-shop conceit.
