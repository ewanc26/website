# WhiteBreeze (Personal Fork)

A customised version of [WhiteBreeze](https://github.com/hugeblank/whitebreeze), a small frontend for [WhiteWind](https://whtwnd.com/) - a Markdown blog service using [ATProto](https://atproto.com/).

This fork serves as both my personal website and blog, modified for personal usage while maintaining the original functionality of allowing self-hosting WhiteWind blog posts.

**_This repository is available on [GitHub](https://github.com/ewanc26/website) and [Tangled](https://tangled.sh/did:plc:ofrbh253gwicbkc5nktqepol/website). GitHub is the primary version, and the Tangled version is a mirror._**

## Project Structure

### Configuration Files

- `.cspell.json`: Configuration for spell checking
- `.npmrc`: NPM configuration file
- `.prettierignore`: Files to ignore for Prettier formatting
- `.vercelignore`: Files to ignore for Vercel deployments
- `compose.yaml`: Docker Compose configuration
- `eslint.config.js`: ESLint configuration
- `package.json`: Project dependencies and scripts
- `postcss.config.js`: PostCSS configuration
- `svelte.config.js`: Svelte configuration
- `tailwind.config.ts`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration
- `vite.config.ts`: Vite build configuration

### Source Code

- `src/`: Main application source
  - `app.css`: Global CSS styles
  - `app.d.ts`: TypeScript declaration file for the SvelteKit app
  - `app.html`: Main HTML template
  - `env.d.ts`: Environment variable declarations
  - `lib/`: Shared components and utilities
    - `components/`: Reusable Svelte components
      - `archive/`: Components related to the archive section (e.g., `YearTabs.svelte`, `PostCard.svelte`)
      - `background/`: Background animation components (e.g., `DynamicShapes.svelte`)
      - `layout/`: Layout components (e.g., `Navigation.svelte`, `Footer.svelte`, `ThemeToggle.svelte`)
      - `main/`: Main page components (e.g., `DynamicLinks.svelte`)
      - `post/`: Blog post components (e.g., `PostContent.svelte`, `PostHeader.svelte`)
      - `profile/`: Shared logic and components for fetching and displaying ATProto profile data (e.g., `Profile.svelte`, `Status.svelte`, `profile.ts`)
      - `shared/`: General shared components (e.g., `NotFoundMessage.svelte`, `ShareIcon.svelte`)
    - `parser.ts`: Content parsing utilities for Markdown
    - `utils/`: Utility functions (e.g., `cache.ts`, `dateFormatter.ts`, `tally.ts`, `textProcessor.ts`)
  - `routes/`: Application routes
    - `+layout.svelte`: Root layout component
    - `+layout.ts`: Root layout server-side code
    - `+page.svelte`: Home page component
    - `blog/`: Blog-related routes
      - `+layout.ts`: Blog layout server-side code
      - `+page.svelte`: Blog index page
      - `[rkey]/`: Dynamic routes for individual blog posts
        - `+page.svelte`: Individual blog post page
        - `+page.ts`: Individual blog post server-side code
      - `rss/`: RSS feed generation
        - `+server.ts`: RSS feed endpoint
    - `info/`: Information page routes
      - `+layout.ts`: Info layout server-side code
      - `+page.svelte`: Info page
    - `now/`: Now page routes
      - `+server.ts`: Now page API endpoint
    - `professional/`: Professional information page routes
      - `+layout.ts`: Professional layout server-side code
      - `+page.svelte`: Professional page
  - `variables.css`: CSS variables for theming

### Static Assets

- `static/`: Static files served directly
  - `.well-known/`: Well-known URIs
    - `atproto-did`: AT Protocol DID configuration, replace with [your own AT Protocol DID](https://atproto.com/guides/glossary#did-decentralized-id)
  - `embed/`: Social media embed images
  - `favicon/`: Favicon and related assets
  - `fonts/`: Custom fonts
  - `lexicons/`: Custom ATProto lexicons
    - `uk/ewancroft/`: Custom lexicons for the project
      - `now.json`: Now page lexicon
      - `pro/`: Professional-specific lexicons
      - `site/`: Site-wide lexicons

### Developmental and Deployment

- `Dockerfile`: Docker container configuration
- `LICENSE`: Project license
- `README.md`: Project documentation
- `package-lock.json`: Lockfile for dependencies
- `website.code-workspace`: VS Code workspace settings

## Usage

### Development

```sh
npm install
npm run dev
```

### Production

Change environment variables:

```env
PUBLIC_ATPROTOCOL_USER="myhandle.bsky.social" # Your handle, or DID
```

For optimal usage, you need the following record types in your [AT Protocol repository](https://atproto.com/specs/repository):

#### Required

- `app.bsky.actor.profile`: Your profile
- `com.whtwnd.blog.entry`: Your blog posts
- `blue.linkat.board`: Your links

#### Optional

> My own lexicons, you can remove them if you want. I'm using them for my own purposes. See `static/lexicons/uk/ewancroft` for the schematic definitions.

- `uk.ewancroft.now`: Your status, displayed on the index page, although it's not required.
- `uk.ewancroft.pro.info`: Your professional information, displayed on the `/professional` route.
- `uk.ewancroft.site.info`: Information about this site, displayed on the `/info` route.

##### ActivityPub

This website is primarily built for the AT Protocol, but includes minor compatibility with the Fediverse/ActivityPub through the use of `fediverse:creator` meta tags for improved content sharing and discoverability on platforms like Mastodon.

To enable this, add the following to your `.env` file:

```env
PUBLIC_ACTIVITYPUB_USER=@user@server.tld
```

This variable is used in `src/lib/components/post/PostHead.svelte` to add a `fediverse:creator` meta tag, in `src/lib/components/shared/ShareIcon.svelte` to enable and configure the Mastodon share button, and in `src/lib/components/layout/Footer.svelte` to conditionally display a Mastodon link in the footer.

#### Standalone

```sh
npm install
npm run build
node index.js
```

Put environment variables ahead of the last command, port can also be configured with `PORT`.

#### Dockerised

Modify `docker-compose.yaml` and change the host port if necessary.

```sh
docker compose up -d
```
