# Personal Website & Data Aggregator

A personal website and data aggregation platform built with SvelteKit, originally forked from [WhiteBreeze](https://github.com/hugeblank/whitebreeze). This project serves as a creative outlet, link aggregate, and digital presence on the decentralised web, demonstrating the potential of AT Protocol for personal publishing whilst maintaining full control over content and presentation.

**_This repository is available on [GitHub](https://github.com/ewanc26/website) and [Tangled](https://tangled.sh/did:plc:ofrbh253gwicbkc5nktqepol/website). GitHub is the primary version, and the Tangled version is a mirror._**

## Purpose

This project serves as a personal website and data aggregation platform that pulls content from multiple sources within the AT Protocol network. It demonstrates the potential of AT Protocol for personal publishing whilst maintaining full control over content and presentation. The site includes custom lexicons for extended functionality and maintains compatibility with both AT Protocol and ActivityPub ecosystems.

Rather than being a content management system where you create posts directly, it acts as a unified display layer for your distributed content across various AT Protocol applications.

### Key Features

- **Blog Integration**: Display WhiteWind blog posts with full markdown support
- **Social Content**: Aggregate Bluesky posts and interactions  
- **Link Management**: Showcase curated links from Linkat
- **Status Updates**: Real-time status display with custom lexicons
- **Music Integration**: Optional Last.fm integration for displaying recent tracks
- **Profile Management**: Unified profile display across platforms
- **Cross-Platform Compatibility**: Limited ActivityPub compatibility for improved content sharing
- **Privacy-First**: No tracking, analytics, or data collection - only uses localStorage for theme preferences

## Template Available

A genericised template version of this website is available at [https://github.com/ewanc26/website-template](https://github.com/ewanc26/website-template), which strips back the personal customisations to provide a clean starting point for your own AT Protocol-powered website.

## Installation

To get started with this project, ensure you have Node.js and npm installed.

### Prerequisites

- Node.js (LTS version recommended)
- npm (comes with Node.js)
- Docker and Docker Compose (for containerised deployment)

### Technology Stack

This project is built with modern web technologies:

- **SvelteKit**: Full-stack web framework
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Typed JavaScript for better development experience
- **Vite**: Fast build tool and development server
- **AT Protocol**: Decentralised social networking protocol
- **Docker**: Containerisation for deployment

### Environment Variables

Before running the application, configure the following environment variables in a `.env` file in the project root:

```ini
PUBLIC_ATPROTOCOL_USER="myhandle.bsky.social" # Your AT Protocol handle or DID
```

#### Optional Environment Variables

- `PUBLIC_LASTFM_USERNAME`: Required for the Now Playing (Last.fm) feature displaying recent tracks
- `PUBLIC_ACTIVITYPUB_USER=@user@server.tld`: Enables limited ActivityPub compatibility for improved content sharing on platforms like Mastodon

## Usage

### Development

To run the project in development mode:

```sh
npm install
npm run dev
```

### Data Sources

This platform aggregates data from your AT Protocol repository. For optimal functionality, ensure you have the following record types in your [AT Protocol repository](https://atproto.com/specs/repository):

#### Required Records

- `app.bsky.actor.profile`: Your profile information
- `com.whtwnd.blog.entry`: Your blog posts (created via WhiteWind)
- `blue.linkat.board`: Your curated links (created via Linkat)

#### Optional Records

##### Custom Lexicons

This project includes custom lexicons designed for personal use:

- `uk.ewancroft.now`: Displays your current status on the index page
- `uk.ewancroft.site.info`: Provides metadata about the site, displayed on the `/site/meta` route

**Note**: These are personal lexicons created for my own use. While others are welcome to use them, no guarantees are made about schema stability - these may be updated without notice.

### Deployment

#### Standalone

To build and run the project as a standalone application:

```sh
npm install
npm run build
node index.js
```

Environment variables can be set before the last command, and the port can be configured with the `PORT` variable.

#### Containerised

To deploy using Docker:

1. Modify `compose.yaml` to change the host port if necessary
2. Run the following command:

```sh
docker compose up -d
```

## Content Management

**Important**: This is a data aggregation and display platform, not a content management system. You cannot create or edit content directly through this website. Instead, content is created through the respective AT Protocol applications:

- **Blog Posts**: Create via [WhiteWind](https://whtwnd.com/)
- **Social Posts**: Create via [Bluesky](https://bsky.app/) 
- **Links**: Manage via [Linkat](https://linkat.blue/)
- **Profile**: Update via [Bluesky](https://bsky.app/) or other AT Protocol clients

The website automatically pulls and displays this content from your AT Protocol repository.

## Privacy & Data Collection

This website respects your privacy and operates with a privacy-first approach:

- **No Tracking**: No analytics, tracking, or third-party cookies are used
- **Local Storage Only**: Only uses localStorage to remember your theme preferences
- **No Data Collection**: No personal data is collected, stored, or shared externally
- **Open Source**: The entire codebase is transparent and available for inspection
- **No Hidden Functionality**: What you see in the code is what runs on the website

## Licensing

This project has significantly diverged from the original WhiteBreeze codebase while maintaining its open-source nature under the AGPL 3.0 license. My blog content is licensed under CC-BY 4.0. Please refer to the `LICENSE` file in the repository for complete licensing information.

## Related Services

This project integrates with several AT Protocol and web services:

- **[WhiteWind](https://whtwnd.com/)**: AT Protocol powered markdown blog service
- **[Bluesky](https://bsky.app/)**: Social platform for content sharing and discovery
- **[Linkat](https://linkat.blue/)**: Link aggregation service using AT Protocol
- **[Last.fm](https://last.fm/)**: Music tracking service for displaying recent tracks