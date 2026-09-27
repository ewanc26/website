# DESIGN.md

Port of the visual system for ewancroft.uk.

## Visual Tokens

- **Palette**: Dynamic OKLCH, predominantly neutral/earthy with primary green accents.
- **Typography**: Inter (Variable) for UI/Prose, JetBrains Mono for Code/Utility.
- **Spacing**: 4pt modular scale (4px, 8px, 12px, 16px, 32px, 64px, 96px).
- **Page gutters**: Fluid from 16px on phones to 32px on wide layouts; avoid breakpoint jumps that reduce usable width as the viewport grows.
- **Motion**: Snap-to-standard `cubic-bezier(0.25, 1, 0.5, 1)` (Quart) for transitions; `expo` for entrances.

## Register: Brand

- **Tone**: Traditional meets Technical.
- **Elements**: Sabbat-aware backgrounds, poetic typography, generous whitespace.

### Display type

- Two poster-scale tokens sit above the interaction type scale: `--text-3xl` (page titles, every `page-hd`) and `--text-4xl` (homepage masthead only). Weight 900, tight tracking, near-1 line-height, fluid on `vw`.
- Reserve poster scale for one focal point per page — the masthead name, a page title. Everything else stays on the standard scale so the jump reads as intentional, not noisy.
- `.text-outline` / `.text-outline--thin` render wireframe display type: an SVG filter (`feMorphology` dilate + `feComposite` cut) leaves one clean contour per glyph. Don't use `-webkit-text-stroke` for this — it traces every overlapping contour inside Inter's variable glyphs and draws stray lines through counters and joins. The `--thin` variant is for sub-640px viewports and secondary wordmarks, where the thicker pass fills in small counters.
- A full-bleed scrolling band (edge to edge, breaking the shell) in the seasonal primary is the one motion-driven brand flourish, used to anchor the masthead. Its loop duration is `--duration-marquee` (60s), tokened separately from the interaction durations since it's a full cycle, not a state transition. Disabled under `prefers-reduced-motion`. Hovering or focusing it pauses the loop and, if the ambient soundscape is on, rings its confirmation chime — pausing a scrolling text is a deliberate "let me read this" gesture, unlike a passing hover elsewhere, so it earns an audible response the way copying a link does.
- The background moon and pentacles (`SabbatBackground.svelte`) wax and wane on `--duration-breath` (16.6667s = 1 / `BREATH_HZ` in `src/lib/music/constants.ts`) — the same rate as the ambient engine's whole-mix breathing LFO. It's the one background layer that's always on screen, silent or not, so when the soundscape is on, what you see and what you hear pulse together. Change one, change the other.
- Page navigations use the View Transitions API (`+layout.svelte`), crossfading and sliding just the content region — chrome (header, footer) never re-transitions. Direction is real, not guessed from route depth: a clicked link or `goto()` pushes the new page up from below (advancing); the browser's actual back/forward buttons get the exact mirror, settling down from above (retreating). Both variants are disabled outright under `prefers-reduced-motion` — see the `!important` note in `system.css` if touching this, since the direction-qualified rules are more specific and would otherwise still win on `animation-name`.

## Register: Product

- **Tone**: Clinical, efficient, dense.
- **Locations**: Blog listings, ATProto profiles, Project indices.
- **Patterns**: Panel primitives, editorial indexes, minimal decoration.

### Editorial indexes

- Use a raised parent surface with a 4px inset to group compact rows.
- Use the Selected Projects row anatomy across UI collections: a clear label, supporting detail, and trailing metadata where relevant.
- Actionable rows share a primary-tinted hover and keyboard-focus highlight. Static rows do not imply interactivity.
- Keep rows spatially stable on hover and focus; communicate state through colour rather than positional movement.
- On tablet and mobile widths, collapse row columns before labels, descriptions, or metadata become cramped; preserve the same raised parent and inset-row hierarchy.
- Keep prose lists semantic and unstyled; this pattern is for navigational and data indexes.

## Anti-references

- **AI Slop**: No generic "Boost productivity" copy, no purple gradients, no heavy glassmorphism.
- **Visual Noise**: No generic drop shadows, no un-weighted icons, no floating transitions without easing.
