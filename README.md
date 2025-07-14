# WhiteBreeze (Personal Fork)

A customised version of [WhiteBreeze](https://github.com/hugeblank/whitebreeze), a small frontend for [WhiteWind](https://whtwnd.com/) - a Markdown blog service using [ATProto](https://atproto.com/).

This fork serves as both my personal website and blog, modified for personal usage while maintaining the original functionality of allowing self-hosting WhiteWind blog posts.

**_This repository is available on [GitHub](https://github.com/ewanc26/website) and [Tangled](https://tangled.sh/did:plc:ofrbh253gwicbkc5nktqepol/website). GitHub is the primary version, and the Tangled version is a mirror._**

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

##### Now Playing (Last.fm)

- `src/lib/components/profile/RecentFM.svelte`: This component displays recent tracks from [Last.fm](https://last.fm). It requires `PUBLIC_LASTFM_USERNAME` to be set in your `.env` file.

##### Custom Lexicons

> My own lexicons, you can remove them if you want. I'm using them for my own purposes. See `static/lexicons/uk/ewancroft` for the schematic definitions.

- `uk.ewancroft.now`: Your status, displayed on the index page, although it's not required.
- `uk.ewancroft.site.info`: Information about this site, displayed on the `/site/meta` route.

##### ActivityPub

This website is primarily built for the AT Protocol, but includes minor compatibility with the Fediverse/ActivityPub through the use of `fediverse:creator` meta tags for improved content sharing and discoverability on platforms like Mastodon.

To enable this, add the following to your `.env` file:

```env
PUBLIC_ACTIVITYPUB_USER=@user@server.tld
```

This variable is used in `src/lib/components/post/PostHead.svelte` to add a `fediverse:creator` meta tag, in `src/lib/components/icons/ShareIcon.svelte` to enable and configure the Mastodon share button, and in `src/lib/components/layout/Footer.svelte` to conditionally display a Mastodon link in the footer.

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
