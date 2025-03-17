# Ewan's Web Corner

A personal website built with Svelte and SvelteKit featuring AT Protocol integration, theme customization, and responsive design.

## Features

- 🌐 **AT Protocol Integration** - Displays profile information from Bluesky/AT Protocol
- 🎨 **Theme Customization** - Multiple color themes and dark/light mode support
- 📱 **Responsive Design** - Mobile-friendly layout
- 🐳 **Docker Support** - Easy deployment with Docker
- 🔧 **SvelteKit** - Built with the latest SvelteKit features
- 💅 **TailwindCSS** - Styled with TailwindCSS for easy customization

## Tech Stack

- **Frontend Framework**: SvelteKit
- **Styling**: TailwindCSS
- **Node Version**: Node 18
- **Build Tool**: Vite
- **Deployment**: Docker with Node adapter

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm, pnpm, or yarn
- Docker and Docker Compose (for containerized deployment)

### Installation

Clone the project and install dependencies:

```bash
# Clone the repository
git clone https://github.com/ewanc26/website website

# Navigate to project directory
cd website

# Install dependencies
npm install
# or
pnpm install
# or
yarn
```

## Development

Start a development server:

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

This project includes Docker configuration for easy deployment:

### Using Docker Compose

```bash
# Start the containers
docker compose up -d

# Stop the containers
docker compose down
```

The site will be available at <http://localhost:3002>

### Manual Docker Build

```bash
# Build the Docker image
docker build -t ewans-web-corner .

# Run the container
docker run -p 3002:3000 -e NODE_ENV=production ewans-web-corner
```

## Configuration

- Modify AT Protocol settings in `src/lib/data/profile.json`
- Update external links in `src/lib/data/external.json`
- Change website title in `src/lib/data/website.json`

## Project Structure

The project uses the standard SvelteKit structure:

- `src/` - Contains the source code
- `src/routes/` - Page components
- `src/lib/` - Shared components and utilities
- `static/` - Static assets

## Environment Variables

- `NODE_ENV` - Set to `production` for production deployments

## License

- Code is licensed under the MIT License
- Text and imagery are licensed under CC BY 4.0
