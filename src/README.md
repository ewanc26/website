# `src` Directory Overview

This directory contains the core source code for the WhiteBreeze (Personal Fork) website, built with SvelteKit. It follows a standard SvelteKit project structure, with routes, components, and utility functions organised for clarity and maintainability.

## Top-Level Files

- <mcfile name="app.d.ts" path="/Users/ewan/Developer/Git/website/src/app.d.ts"></mcfile>: Type declarations for the SvelteKit application, extending the global types.
- <mcfile name="app.html" path="/Users/ewan/Developer/Git/website/src/app.html"></mcfile>: The main HTML template for the SvelteKit application. This is where the Svelte app is injected.
- <mcfile name="env.d.ts" path="/Users/ewan/Developer/Git/website/src/env.d.ts"></mcfile>: Type declarations for environment variables, ensuring type safety when accessing `import.meta.env`.

## `lib` Directory

This directory contains reusable components, utility functions, and other modules that are not directly tied to specific routes.

### `lib/components`

Contains all Svelte components used throughout the application, organised by their functional area.

- `lib/components/archive/`: Components related to displaying archived content, such as blog posts organised by year and month.
  - <mcfile name="ArchiveCard.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/archive/ArchiveCard.svelte"></mcfile>: A component for displaying individual archive items (e.g., links).
  - <mcfile name="MonthSection.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/archive/MonthSection.svelte"></mcfile>: Organises and displays content for a specific month within the archive.
  - <mcfile name="StatsDisplay.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/archive/StatsDisplay.svelte"></mcfile>: Displays statistical information, such as total read time or word count.
  - <mcfile name="YearContent.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/archive/YearContent.svelte"></mcfile>: Displays content organised by year.
  - <mcfile name="YearTabs.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/archive/YearTabs.svelte"></mcfile>: Provides navigation tabs for different years in the archive.
  - <mcfile name="index.ts" path="/Users/ewan/Developer/Git/website/src/lib/components/archive/index.ts"></mcfile>: Export file for the archive components.
- `lib/components/icons/`: Contains Svelte components for various icons used across the site.
  - <mcfile name="index.ts" path="/Users/ewan/Developer/Git/website/src/lib/components/icons/index.ts"></mcfile>: Export file for the icon components.
  - `lib/components/icons/social/`: Icons for social media platforms.
    - <mcfile name="BlueskyIcon.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/icons/social/BlueskyIcon.svelte"></mcfile>: Bluesky social media icon.
    - <mcfile name="FacebookIcon.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/icons/social/FacebookIcon.svelte"></mcfile>: Facebook social media icon.
    - <mcfile name="MastodonIcon.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/icons/social/MastodonIcon.svelte"></mcfile>: Mastodon social media icon.
    - <mcfile name="RedditIcon.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/icons/social/RedditIcon.svelte"></mcfile>: Reddit social media icon.
    - <mcfile name="RssIcon.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/icons/social/RssIcon.svelte"></mcfile>: RSS feed icon.
    - <mcfile name="ShareIcons.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/icons/social/ShareIcons.svelte"></mcfile>: A collection of share icons.
  - `lib/components/icons/utility/`: General utility icons.
    - <mcfile name="BookOpenIcon.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/icons/utility/BookOpenIcon.svelte"></mcfile>: Book open icon.
    - <mcfile name="CopyLinkIcon.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/icons/utility/CopyLinkIcon.svelte"></mcfile>: Copy link icon.
    - <mcfile name="HomeIcon.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/icons/utility/HomeIcon.svelte"></mcfile>: Home icon.
    - <mcfile name="LinkIcon.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/icons/utility/LinkIcon.svelte"></mcfile>: Link icon.
    - <mcfile name="MoonIcon.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/icons/utility/MoonIcon.svelte"></mcfile>: Moon icon (often used for dark mode toggle).
    - <mcfile name="PostIcon.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/icons/utility/PostIcon.svelte"></mcfile>: Post icon.
    - <mcfile name="SunIcon.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/icons/utility/SunIcon.svelte"></mcfile>: Sun icon (often used for light mode toggle).
- `lib/components/layout/`: Components that define the overall structure and layout of the website.
  - <mcfile name="Navigation.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/layout/Navigation.svelte"></mcfile>: The main navigation bar of the site.
  - <mcfile name="ThemeToggle.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/layout/ThemeToggle.svelte"></mcfile>: A component to switch between light and dark themes.
  - <mcfile name="index.ts" path="/Users/ewan/Developer/Git/website/src/lib/components/layout/index.ts"></mcfile>: Export file for layout components.
  - `lib/components/layout/footer/`: Components specific to the website's footer.
    - <mcfile name="LastCommit.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/layout/footer/LastCommit.svelte"></mcfile>: Displays information about the last commit.
    - <mcfile name="Main.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/layout/footer/Main.svelte"></mcfile>: The main footer component.
    - <mcfile name="TidClock.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/layout/footer/TidClock.svelte"></mcfile>: Displays a "TID" clock (likely a custom time format).
  - `lib/components/layout/main/`: Components for the main content area.
    - <mcfile name="DynamicLinks.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/layout/main/DynamicLinks.svelte"></mcfile>: Displays dynamically loaded links.
    - <mcfile name="index.ts" path="/Users/ewan/Developer/Git/website/src/lib/components/layout/main/index.ts"></mcfile>: Export file for main layout components.
- `lib/components/post/`: Components for displaying blog posts.
  - <mcfile name="PostContent.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/post/PostContent.svelte"></mcfile>: Renders the main content of a blog post.
  - <mcfile name="PostHead.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/post/PostHead.svelte"></mcfile>: Handles metadata and `<svelte:head>` elements for a post.
  - <mcfile name="PostHeader.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/post/PostHeader.svelte"></mcfile>: Displays the header section of a blog post, including title and author information.
  - <mcfile name="PostNavigation.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/post/PostNavigation.svelte"></mcfile>: Provides navigation between posts (e.g., previous/next).
  - <mcfile name="index.ts" path="/Users/ewan/Developer/Git/website/src/lib/components/post/index.ts"></mcfile>: Export file for post components.
- `lib/components/profile/`: Components related to user profile display.
  - <mcfile name="Profile.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/profile/Profile.svelte"></mcfile>: Displays the user's profile information.
  - <mcfile name="Status.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/profile/Status.svelte"></mcfile>: Displays the user's current status or "now playing" information.
  - <mcfile name="index.ts" path="/Users/ewan/Developer/Git/website/src/lib/components/profile/index.ts"></mcfile>: Export file for profile components.
  - <mcfile name="profile.ts" path="/Users/ewan/Developer/Git/website/src/lib/components/profile/profile.ts"></mcfile>: Utility functions for fetching and managing profile data.
- `lib/components/shared/`: General-purpose components or interfaces shared across different parts of the application.
  - <mcfile name="NotFoundMessage.svelte" path="/Users/ewan/Developer/Git/website/src/lib/components/shared/NotFoundMessage.svelte"></mcfile>: A component to display when content is not found.
  - <mcfile name="index.ts" path="/Users/ewan/Developer/Git/website/src/lib/components/shared/index.ts"></mcfile>: Export file for shared components.
  - <mcfile name="interfaces.ts" path="/Users/ewan/Developer/Git/website/src/lib/components/shared/interfaces.ts"></mcfile>: TypeScript interfaces defining data structures used throughout the application.

### `lib/css`

Contains global CSS styles and variables.

- <mcfile name="animations.css" path="/Users/ewan/Developer/Git/website/src/lib/css/animations.css"></mcfile>: Defines CSS animations.
- <mcfile name="app.css" path="/Users/ewan/Developer/Git/website/src/lib/css/app.css"></mcfile>: Main application-wide CSS styles.
- <mcfile name="variables.css" path="/Users/ewan/Developer/Git/website/src/lib/css/variables.css"></mcfile>: Defines CSS variables, often used for theming.

### `lib` Top-Level Files

- <mcfile name="parser.ts" path="/Users/ewan/Developer/Git/website/src/lib/parser.ts"></mcfile>: Handles markdown parsing and conversion to HTML, including sanitisation and image URL upgrades.
- <mcfile name="themeLoader.ts" path="/Users/ewan/Developer/Git/website/src/lib/themeLoader.ts"></mcfile>: Manages the loading and application of themes (e.g., light/dark mode).

### `lib/utils`

Contains various utility functions used across the application.

- <mcfile name="cache.ts" path="/Users/ewan/Developer/Git/website/src/lib/utils/cache.ts"></mcfile>: Utility functions for caching data.
- <mcfile name="dateFormatter.ts" path="/Users/ewan/Developer/Git/website/src/lib/utils/dateFormatter.ts"></mcfile>: Functions for formatting dates and times.
- <mcfile name="tally.ts" path="/Users/ewan/Developer/Git/website/src/lib/utils/tally.ts"></mcfile>: Utility functions for calculating statistics, such as read time and word count.
- <mcfile name="textProcessor.ts" path="/Users/ewan/Developer/Git/website/src/lib/utils/textProcessor.ts"></mcfile>: Functions for processing text, such as extracting excerpts or counting words.

## `routes` Directory

This directory defines the different pages and API endpoints of the SvelteKit application.

- <mcfile name="+layout.svelte" path="/Users/ewan/Developer/Git/website/src/routes/+layout.svelte"></mcfile>: The root layout component applied to all pages.
- <mcfile name="+layout.ts" path="/Users/ewan/Developer/Git/website/src/routes/+layout.ts"></mcfile>: The root layout load function, fetching data available to all pages.
- <mcfile name="+page.svelte" path="/Users/ewan/Developer/Git/website/src/routes/+page.svelte"></mcfile>: The main index page of the website.
- `routes/blog/`: Contains routes and components related to the blog section.
  - <mcfile name="+layout.ts" path="/Users/ewan/Developer/Git/website/src/routes/blog/+layout.ts"></mcfile>: Layout load function for blog pages.
  - <mcfile name="+page.svelte" path="/Users/ewan/Developer/Git/website/src/routes/blog/+page.svelte"></mcfile>: The main blog index page, listing all posts.
  - `routes/blog/[rkey]/`: Dynamic route for individual blog posts, where `[rkey]` is the unique identifier for a post.
    - <mcfile name="+page.svelte" path="/Users/ewan/Developer/Git/website/src/routes/blog/[rkey]/+page.svelte"></mcfile>: Displays the content of a single blog post.
    - <mcfile name="+page.ts" path="/Users/ewan/Developer/Git/website/src/routes/blog/[rkey]/+page.ts"></mcfile>: Load function for fetching data for a single blog post.
  - `routes/blog/rss/`: Contains the RSS feed endpoint for the blog.
    - <mcfile name="+server.ts" path="/Users/ewan/Developer/Git/website/src/routes/blog/rss/+server.ts"></mcfile>: An API endpoint that generates the RSS feed for blog posts.
- `routes/now/`: Contains routes related to the "now" page.
  - <mcfile name="+server.ts" path="/Users/ewan/Developer/Git/website/src/routes/now/+server.ts"></mcfile>: An API endpoint for the "now" status.
- `routes/site/meta/`: Contains routes for site metadata and information.
  - <mcfile name="+layout.ts" path="/Users/ewan/Developer/Git/website/src/routes/site/meta/+layout.ts"></mcfile>: Layout load function for the site metadata pages.
  - <mcfile name="+page.svelte" path="/Users/ewan/Developer/Git/website/src/routes/site/meta/+page.svelte"></mcfile>: Displays information about the website, such as technology stack and privacy policy.