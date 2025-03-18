# Ewan's Web Corner

Welcome to the repository for **Ewan's Web Corner**, my personal website. This site is where I share my thoughts on coding, technology, and various aspects of my life.

## Site Overview

The site is built using **atproto** technology, and the structure is optimised to display posts, profile information, and various content in a user-friendly way. It's also designed to be easy to navigate, with pages like **About** and **Verification** accessible directly from the sidebar.

It is based on the fantastic work by [fei.chicory.blue](https://codeberg.org/fei-chicory-blue/atproto-site), just with my own tweaks.

### Features

- **Customisable Layout:** The page layout features a left sidebar with profile info, navigation links, and pagination. The right column is dedicated to displaying posts.
- **Posts:** The site supports multiple post types, including text posts, image posts, and embedded content. Posts can be customised with rich media, such as images and embedded cards.
- **Profile Information:** The left sidebar includes a space for a profile picture, username, description, and external links.
- **Mobile Optimisation:** The site is optimised for mobile browsing, with a responsive design that adjusts to different screen sizes.

For more details on customisation, refer to the documentation on WhiteWind [here](https://whtwnd.com/did:plc:xz3euvkhf44iadavovbsmqoo/3laxrz4dl4s2f).

### Powered by atproto

The site is powered by the [atproto platform](https://atproto.com), which enables decentralised content hosting. This allows you to integrate various platforms and manage your content seamlessly.

## Running the Site with Docker

To run the site using Docker Compose, follow these steps:

1. Build and start the Docker container:

   ```sh
   docker compose up --build -d
   ```

This will build your Docker image and start the website inside a Docker container, making it accessible on port `3002`.

## Deploying with Cloudflare Tunnel

To deploy the site through a Cloudflare Tunnel, follow these steps:

### On macOS

1. Install the Cloudflare Tunnel client (`cloudflared`):

   ```sh
   brew install cloudflare/cloudflare/cloudflared
   ```

2. Authenticate `cloudflared` with your Cloudflare account:

   ```sh
   cloudflared login
   ```

3. Create a tunnel and give it a name:

   ```sh
   cloudflared tunnel create my-tunnel
   ```

4. Configure the tunnel to route traffic to your Docker container:

   ```sh
   cloudflared tunnel route dns my-tunnel mywebsite.example.com
   ```

5. Start the tunnel and route traffic to your local Docker container running on port `3002`:

   ```sh
   cloudflared tunnel --url http://localhost:3002 run my-tunnel
   ```

### On Ubuntu Server

1. Install the Cloudflare Tunnel client (`cloudflared`):

   ```sh
   sudo apt-get update
   sudo apt-get install -y wget
   wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
   sudo dpkg -i cloudflared-linux-amd64.deb
   ```

2. Authenticate `cloudflared` with your Cloudflare account:

   ```sh
   cloudflared login
   ```

3. Create a tunnel and give it a name:

   ```sh
   cloudflared tunnel create my-tunnel
   ```

4. Configure the tunnel to route traffic to your Docker container:

   ```sh
   cloudflared tunnel route dns my-tunnel mywebsite.example.com
   ```

5. Start the tunnel and route traffic to your local Docker container running on port `3002`:

   ```sh
   cloudflared tunnel --url http://localhost:3002 run my-tunnel
   ```
