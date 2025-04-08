# Ewan's Personal Website

A customized personal website built using SvelteKit and Tailwind CSS, based on [my blog](https://blog.ewancroft.uk) which was originally forked from [WhiteBreeze](https://github.com/whitewind/whitebreeze).

This repository contains all configuration files for my personal website including:

- Core configuration: `package.json`, `vite.config.ts`, `svelte.config.js`
- Styling: `tailwind.config.ts`, `postcss.config.js`
- Linting: `eslint.config.js`, `.prettierignore`
- Build/deployment: `Dockerfile`, `compose.yaml`, `.vercelignore`
- Project structure: `src/`, `static/`, `.svelte-kit/`

***This repository is available on [GitHub](https://github.com/ewanc26/website) and [Tangled](https://tangled.sh/@ewancroft.uk/website). GitHub is the primary version, and the Tangled version is a mirror.***

## Usage

### Development

```sh
npm install
npm run dev
```

### Production

Change environment variables:

```env
PUBLIC_HANDLE="myhandle.bsky.social" # Your handle, or DID
```

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
