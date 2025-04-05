# Deploying to Vercel

This guide explains how to deploy your website to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Vercel CLI (optional for local development)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard

- **Push your code to a Git repository** (GitHub, GitLab, or Bitbucket)

- **Import your project in Vercel**:

  - Visit [vercel.com/new](https://vercel.com/new)
  - Connect your Git provider and select your repository
  - Vercel will automatically detect the project type

- **Configure your project**:

  - Root directory: `/` (project root)
  - Build command: leave empty for static sites
  - Output directory: leave empty (uses project root by default)

- **Deploy**:
  - Click "Deploy" and monitor the deployment progress
  - Once complete, Vercel will provide your site's URL

### Option 2: Deploy via Vercel CLI

- **Install Vercel CLI**:

```bash
   npm install -g vercel
```

- **Login to Vercel**:

```bash
   vercel login
```

- **Deploy your project**:

```bash
   cd /path/to/your/project
   vercel
```

- **Follow the prompts**:

  - Verify deployment settings
  - Wait for deployment completion and URL assignment

- **Deploy to production**:

```bash
   vercel --prod
```

## Configuration Files

Essential Vercel configuration files:

- `vercel.json`: Configures build settings and routing
- `package.json`: Defines project metadata and scripts
- `.vercelignore`: Lists files to exclude from deployment

## Custom Domain Setup

To configure your custom domain:

- Access project settings in Vercel dashboard
- Select "Domains" section
- Add and verify your domain
- Configure DNS settings as specified by Vercel

## Environment Variables

To set up environment variables:

- Open project settings in Vercel dashboard
- Go to "Environment Variables" section
- Add necessary variables

## Troubleshooting

Common issues and solutions:

- `.well-known` directory issues: Verify `vercel.json` route configuration
- Static asset problems: Check for correct relative path usage
- Additional help: Visit [Vercel's documentation](https://vercel.com/docs)
