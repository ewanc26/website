# Documentation

Welcome to the project documentation! This directory contains all technical documentation for the AT Protocol-powered personal website.

## 📚 Available Documentation

### [Configuration Guide](./configuration.md)
Complete setup and configuration guide for your personal website. Covers:
- Environment variables setup
- Publication slug mapping
- Static file customization
- Optional features (WhiteWind, CORS, etc.)
- Troubleshooting common issues

**Start here if you're setting up the site for the first time.**

### [Theme System](./theme-system.md)
Documentation for the centralized color theme system. Learn how to:
- Add new Colour Themes
- Customize existing themes
- Understand the theme architecture
- Use the theme configuration API

**Read this if you want to customize or add Colour Themes.**

## 🚀 Quick Links

- [Main README](../README.md) - Project overview and features
- [Environment Example](../.env.example) - Environment variable template
- [Theme Config](../src/lib/config/themes.config.ts) - Central theme configuration

## 📖 Documentation Structure

```
docs/
├── README.md           # This file - documentation index
├── configuration.md    # Setup and configuration guide
└── theme-system.md     # Theme system documentation
```

## 💡 Contributing to Documentation

When adding new documentation:

1. Create a new `.md` file in this directory
2. Add it to the "Available Documentation" section above
3. Use clear headings and examples
4. Include a table of contents for longer documents
5. Link to related documentation where relevant

## 🔗 External Resources

- [AT Protocol Documentation](https://atproto.com/)
- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Bluesky](https://bsky.app/)
