# DESIGN.md

Port of the visual system for ewancroft.uk.

## Visual Tokens

- **Palette**: Dynamic OKLCH, predominantly neutral/earthy with primary green accents.
- **Typography**: Inter (Variable) for UI/Prose, JetBrains Mono for Code/Utility.
- **Spacing**: 4pt modular scale (4px, 8px, 12px, 16px, 32px, 64px, 96px).
- **Motion**: Snap-to-standard `cubic-bezier(0.25, 1, 0.5, 1)` (Quart) for transitions; `expo` for entrances.

## Register: Brand

- **Tone**: Traditional meets Technical.
- **Elements**: Sabbat-aware backgrounds, poetic typography, generous whitespace.

## Register: Product

- **Tone**: Clinical, efficient, dense.
- **Locations**: Blog listings, ATProto profiles, Project indices.
- **Patterns**: Panel primitives, editorial indexes, minimal decoration.

### Editorial indexes

- Use a raised parent surface with a 4px inset to group compact rows.
- Use the Selected Projects row anatomy across UI collections: a clear label, supporting detail, and trailing metadata where relevant.
- Actionable rows share a primary-tinted hover and keyboard-focus highlight. Static rows do not imply interactivity.
- Keep rows spatially stable on hover and focus; communicate state through colour rather than positional movement.
- Keep prose lists semantic and unstyled; this pattern is for navigational and data indexes.

## Anti-references

- **AI Slop**: No generic "Boost productivity" copy, no purple gradients, no heavy glassmorphism.
- **Visual Noise**: No generic drop shadows, no un-weighted icons, no floating transitions without easing.
