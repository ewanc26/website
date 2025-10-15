# Personal Website & AT Protocol Showcase

A modern, accessible personal website built with SvelteKit 2 and Tailwind CSS 4, showcasing the power of the AT Protocol ecosystem. This platform pulls content from your AT Protocol repository and displays it in a clean, privacy-respecting interface with excellent performance and accessibility.

**_This repository is available on [GitHub](https://github.com/ewanc26/website) and mirrored on [Tangled](https://tangled.org/did:plc:ofrbh253gwicbkc5nktqepol/website)._**

## Purpose

This website serves as a unified digital presence that aggregates and displays content from the decentralized AT Protocol network. Unlike traditional content management systems, it acts as a display layer for your distributed content, demonstrating the potential of AT Protocol for personal publishing while maintaining full control over presentation and user experience.

### Key Features

- **Modern Design System**: Custom colour palette using OKLCH colour space for perceptually uniform colours across light and dark modes
- **Accessibility First**: WCAG 2.1 AA compliant with proper contrast ratios and semantic HTML
- **Performance Optimised**: Built with SvelteKit 5 and Tailwind CSS 4 for lightning-fast load times
- **AT Protocol Integration**: Native integration with Bluesky, Linkat, and custom lexicons
- **Responsive Design**: Fully responsive layout that works beautifully on all devices
- **Privacy-Focused**: No tracking, no analytics, no data collection — only localStorage for theme preferences
- **Dynamic Content**: Real-time profile, status updates, and curated links from AT Protocol
- **Slingshot PDS Resolution**: Automatic PDS endpoint discovery for your AT Protocol identity

## Technology Stack

This project leverages modern web technologies and standards:

- **[SvelteKit 2](https://kit.svelte.dev/)**: Full-stack web framework with excellent DX
- **[Svelte 5](https://svelte.dev/)**: Next-generation reactive framework with runes
- **[Tailwind CSS 4](https://tailwindcss.com/)**: Modern utility-first CSS with native cascade layers
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe JavaScript for better development experience
- **[Vite 7](https://vite.dev/)**: Lightning-fast build tool and development server
- **[@atproto/api](https://github.com/bluesky-social/atproto)**: Official AT Protocol client library
- **[Lucide Icons](https://lucide.dev/)**: Beautiful, consistent icon set

## Installation

### Prerequisites

- **Node.js** (v20 or later recommended)
- **npm** (comes with Node.js)

### Quick Start

1. Clone the repository:

    ```bash
    git clone git:github.com/ewanc26/website # or git:tangled.org/did:plc:ofrbh253gwicbkc5nktqepol/website
    cd website
    ```

1. Install dependencies:

    ```bash
    npm install
    ```

1. Configure environment variables by creating a `.env` file:

    ```ini
    # Your ATProto DID (Decentralized Identifier)
    # Find this by searching your AT Protocol alias (aka your Bluesky handle) on https://PDSls.dev
    PUBLIC_ATPROTO_DID=did:plc:your-did-here
    ```

1. Start the development server:

    ```bash
    npm run dev
    ```

Visit `http://localhost:5173` to see your website in action!

## Development

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run check        # Type-check your code
npm run check:watch  # Type-check in watch mode
npm run format       # Format code with Prettier
npm run lint         # Check code formatting
````

### Project Structure

```plaintext
website/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── Header.svelte
│   │   │       ├── Footer.svelte
│   │   │       ├── NavLinks.svelte
│   │   │       └── main/
│   │   │           ├── DynamicLinks.svelte
│   │   │           ├── ScrollToTop.svelte
│   │   │           └── card/
│   │   │               ├── LinkCard.svelte
│   │   │               ├── ProfileCard.svelte
│   │   │               └── StatusCard.svelte
│   │   ├── services/
│   │   │   └── atproto.ts          # AT Protocol integration
│   │   ├── helper/
│   │   │   ├── siteMeta.ts         # SEO metadata management
│   │   │   └── metaTags.ts         # Meta tag generation
│   │   ├── data/
│   │   │   └── navItems.ts         # Navigation configuration
│   │   └── utils/
│   │       └── formatDate.ts       # Date formatting utilities
│   ├── routes/
│   │   ├── +layout.svelte          # Root layout
│   │   ├── +page.svelte            # Home page
│   │   └── site/
│   │       └── meta/
│   │           └── +page.svelte    # Site metadata page
│   ├── app.css                     # Global styles & design tokens
│   └── app.html                    # HTML template
├── static/
│   └── favicon/                    # Favicon assets
├── .env                            # Environment variables
├── package.json
├── svelte.config.js
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Content Sources

This platform aggregates content from your AT Protocol repository. For full functionality, ensure you have the following in your [AT Protocol repository](https://atproto.com/specs/repository):

### Required Records

- **`app.bsky.actor.profile`**: Your profile information (display name, bio, avatar, banner)

### Optional Records

#### Linkat Integration

- **`blue.linkat.board`**: Your curated links from [Linkat](https://linkat.blue/)

  - Displays on the home page as a dynamic link collection

#### Custom Lexicons

This project uses custom AT Protocol lexicons for enhanced functionality:

- **`uk.ewancroft.now`**: Current status display

  - Shows your current status on the home page
  - Create/update via AT Protocol clients

- **`uk.ewancroft.site.info`**: Website metadata

  - Technology stack information
  - Privacy statement
  - Open source details and credits
  - Displayed on `/site/meta` route

**Note**: These are personal lexicons created for specific use cases. While you're welcome to use them, schema stability is not guaranteed — they may evolve without notice.

## Design System

The website uses a carefully crafted design system with custom colour palettes in OKLCH colour space for perceptually uniform colours:

### Colour Palettes

- **Ink**: Text colours optimised for readability
- **Canvas**: Background colours with proper contrast
- **Sage**: Primary accent colours
- **Mint**: Secondary accent colours
- **Jade**: Additional accent colours

All colours are designed to:

- Meet WCAG 2.1 AA contrast requirements
- Work beautifully in both light and dark modes
- Provide perceptually uniform colour transitions
- Support the `light-dark()` CSS function for automatic theme switching

### Accessibility Features

- **Contrast Ratios**: All text meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- **Semantic HTML**: Proper heading hierarchy and landmark regions
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and descriptions where needed
- **Focus Indicators**: Visible focus states for interactive elements
- **Colour Independence**: Information is not conveyed by colour alone

## Deployment

### Production Build

Build the project for production:

```bash
npm run build
```

The built files will be in the `build/` directory, ready to deploy to your preferred hosting platform.

### Recommended Hosting Platforms

- **[Vercel](https://vercel.com/)**: Zero-config deployment with automatic previews
- **[Netlify](https://netlify.com/)**: Continuous deployment with serverless functions
- **[Cloudflare Pages](https://pages.cloudflare.com/)**: Fast global CDN with edge functions
- **[GitHub Pages](https://pages.github.com/)**: Free static hosting for GitHub repositories

All platforms support SvelteKit out of the box with automatic adapter detection.

## Content Management

**Important**: This is a display platform, not a content management system. You create content through AT Protocol applications, and it automatically appears on your website.

### Creating Content

- **Profile Updates**: Edit via [Bluesky](https://bsky.app/) settings
- **Status Updates**: Create `uk.ewancroft.now` records via AT Protocol clients
- **Links**: Manage via [Linkat](https://linkat.blue/)
- **Site Metadata**: Create `uk.ewancroft.site.info` records via AT Protocol clients

The website automatically fetches and displays this content with a 5-minute cache for optimal performance.

## Privacy & Security

This website is built with privacy as a core principle:

- **No Tracking**: Zero analytics, tracking pixels, or third-party cookies
- **No Data Collection**: No personal data is collected, stored, or shared
- **Local Storage Only**: Only uses localStorage for theme preferences
- **Open Source**: Complete transparency — inspect the code yourself
- **No External Dependencies**: All fonts and assets are self-hosted
- **Content Security**: Proper CSP headers recommended for deployment

## Customisation

### Personalising Your Site

1. **Update Environment Variables**: Set your `PUBLIC_ATPROTO_DID` in `.env`
2. **Modify Navigation**: Edit `src/lib/data/navItems.ts` to change navigation links
3. **Customise Colours**: Adjust colour palettes in `src/app.css`
4. **Update Metadata**: Edit `src/lib/helper/siteMeta.ts` for default SEO values
5. **Add/Remove Features**: Modify components in `src/lib/components/`

### Extending Functionality

The modular architecture makes it easy to:

- Add new AT Protocol lexicons
- Create additional pages and routes
- Integrate new AT Protocol services
- Customise the design system
- Add additional data sources

## Browser Support

This website supports all modern browsers:

- **Chrome/Edge**: 90+
- **Firefox**: 88+
- **Safari**: 14.1+
- **Mobile browsers**: iOS Safari 14.5+, Chrome Android 90+

Modern CSS features used:

- `light-dark()` function for automatic theming
- CSS custom properties (variables)
- CSS Grid and Flexbox
- Container queries (progressive enhancement)

## Contributing

While this is a personal website, contributions for bug fixes and improvements are welcome:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/improvement`
3. Make your changes with clear commit messages
4. Test thoroughly across browsers
5. Submit a pull request

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. See the `LICENSE` file for complete details.

This means:

- You can use, modify, and distribute this code
- You must disclose source code for any modifications
- You must use the same AGPL-3.0 licence
- If you run a modified version as a network service, you must make the source available

## Related Projects

This website integrates with the AT Protocol ecosystem:

- **[Bluesky](https://bsky.app/)**: Social network for profile and content
- **[Linkat](https://linkat.blue/)**: Link aggregation service using AT Protocol
- **[AT Protocol](https://atproto.com/)**: The decentralised protocol powering it all

## Acknowledgements

This website focuses on modern web standards, accessibility, and streamlined functionality. Built with ❤️ using the latest web technologies and best practices.

---

**Questions or issues?** Open an issue on GitHub or reach out via Bluesky!
