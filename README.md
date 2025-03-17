# Ewan's Web Corner

A personal website built with Svelte featuring AT Protocol integration, theme customization, and responsive design.

## Features

- 🌐 **AT Protocol Integration** - Displays profile information from Bluesky/AT Protocol
- 🎨 **Theme Customization** - Multiple color themes and dark/light mode support
- 📱 **Responsive Design** - Mobile-friendly layout
- 🐳 **Docker Support** - Easy deployment with Docker Compose

## Development

Once you've cloned the project (`git clone https://github.com/ewanc26/website website`) and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
# Start the development server
npm run dev

# Start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## Docker Deployment

This project includes Docker Compose configuration for easy deployment:

```bash
# Start the containers
docker compose up -d

# Stop the containers
docker compose down
```

The site will be available at <http://localhost:3002>

## Configuration

- Modify AT Protocol settings in `src/lib/data/profile.json`
- Update external links in `src/lib/data/external.json`
- Change website title in `src/lib/data/website.json`

## License

- Code is licensed under the MIT License
- Text and imagery are licensed under CC BY 4.0
