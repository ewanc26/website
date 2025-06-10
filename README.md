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
  - `app.html`: Main HTML template
  - `lib/`: Shared components and utilities
    - `components/`: Reusable Svelte components
      - `profile/`: Shared logic for fetching and caching ATProto profile data, used by both the root and blog layouts.
    - `dateFormatter.ts`: Date formatting utilities
    - `parser.ts`: Content parsing utilities
  - `routes/`: Application routes
    - `+layout.svelte`: Root layout component
    - `+layout.ts`: Layout server-side code (imports profile logic from `lib/components/profile/profile.ts`)
    - `+page.svelte`: Home page component
    - `blog/`: Blog-related routes (also imports profile logic from `lib/components/profile/profile.ts`)
    - `info/`: Information page routes
    - `now/`: Now page routes (contains `+server.ts` for RSS feed generation)
    - `professional/`: Professional information page routes

### Static Assets

- `static/`: Static files served directly
  - `.well-known/atproto-did`: AT Protocol DID configuration (auto-generated)
  - `Screenshot.png`: Website screenshot
  - `embed/`: Social media embed images
  - `favicon/`: Favicon and related assets
  - `lexicons/`: Custom ATProto lexicons

### Development and Deployment Scripts

- `scripts/`: Build and deployment utilities
  - `at-res-gen.js`: AT Protocol DID generation script
- `Dockerfile`: Docker container configuration
- `LICENSE`: Project license
- `README.md`: Project documentation
- `package-lock.json`: Lockfile for dependencies
- `website.code-workspace`: VS Code workspace settings

## Usage

### Development

The development server automatically generates the AT Protocol DID configuration before starting:

```sh
npm install
npm run dev
```

### Production

Change environment variables:

```env
PUBLIC_ATPROTOCOL_USER="myhandle.bsky.social" # Your handle, or DID
```

The build process automatically generates the `.well-known/atproto-did` file based on your `PUBLIC_ATPROTOCOL_USER` environment variable, resolving handles to DIDs as needed.

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

The build process includes automatic DID generation:

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

## AT Protocol Integration

This project includes automatic AT Protocol DID configuration:

- **Automatic DID Resolution**: The build script automatically resolves your handle to a DID if needed
- **Domain Verification**: Generates `.well-known/atproto-did` for domain-based identity verification
- **Environment Integration**: Uses `PUBLIC_ATPROTOCOL_USER` from your environment variables or `.env` file
- **Build Integration**: DID generation runs automatically during both development and production builds

The `scripts/at-res-gen.js` handles the complete AT Protocol identity setup, ensuring your domain properly verifies your AT Protocol identity.
