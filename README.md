# WhiteBreeze (Personal Fork)

A customised version of [WhiteBreeze](https://github.com/hugeblank/whitebreeze), a small frontend for [WhiteWind](https://whtwnd.com/) - a Markdown blog service using [ATProto](https://atproto.com/).

This fork serves as both my personal website and blog, modified for personal usage while maintaining the original functionality of allowing self-hosting WhiteWind blog posts.

**_This repository is available on [GitHub](https://github.com/ewanc26/website) and [Tangled](https://tangled.sh/did:plc:ofrbh253gwicbkc5nktqepol/website). GitHub is the primary version, and the Tangled version is a mirror._**

## Purpose

This project provides a personal website and blog frontend, built upon the WhiteBreeze framework, allowing for self-hosted blog posts using the AT Protocol.

## Installation

To get started with this project, ensure you have Node.js and npm installed.

### Prerequisites

- Node.js (LTS version recommended)
- npm (comes with Node.js)
- Docker and Docker Compose (for Dockerised deployment)

### Environment Variables

Before running the application, configure the following environment variables in a `.env` file in the project root:

```ini
PUBLIC_ATPROTOCOL_USER="myhandle.bsky.social" # Your handle, or DID
```

#### Optional Environment Variables

- `PUBLIC_LASTFM_USERNAME`: Required for the Now Playing (Last.fm) feature in `src/lib/components/profile/Status.svelte`.
- `PUBLIC_ACTIVITYPUB_USER=@user@server.tld`: Enables ActivityPub compatibility for improved content sharing and discoverability. This variable is used in `src/lib/components/post/PostHead.svelte`, `src/lib/components/icons/ShareIcon.svelte`, and `src/lib/components/layout/Footer.svelte`.

## Usage

### Development

To run the project in development mode:

```sh
npm install
npm run dev
```

### Production

For optimal usage in production, you need the following record types in your [AT Protocol repository](https://atproto.com/specs/repository):

#### Required Records

- `app.bsky.actor.profile`: Your profile.
- `com.whtwnd.blog.entry`: Your blog posts.
- `blue.linkat.board`: Your links.

#### Optional Features

##### Custom Lexicons

This fork includes custom lexicons for specific functionalities:

- `uk.ewancroft.now`: Displays your current status on the index page (optional).
- `uk.ewancroft.site.info`: Provides information about this site, displayed on the `/site/meta` route.

### Deployment

#### Standalone

To build and run the project as a standalone application:

```sh
npm install
npm run build
node index.js
```

Environment variables can be set before the last command, and the port can be configured with the `PORT` variable.

#### Dockerised

To deploy using Docker:

1. Modify `compose.yaml` to change the host port if necessary.
2. Run the following command:

```sh
docker compose up -d
```

## Licensing

This project is a personal fork of WhiteBreeze. Please refer to the `LICENSE` file in the repository for licensing information.