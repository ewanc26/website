# `src` Directory Overview

This directory contains the core source code for the WhiteBreeze (Personal Fork) website, built with SvelteKit. It follows a standard SvelteKit project structure, with routes, components, and utility functions organised for clarity and maintainability.

## Top-Level Files

- `app.d.ts`: Type declarations for the SvelteKit application, extending the global types.
- `app.html`: The main HTML template for the SvelteKit application. This is where the Svelte app is injected.
- `env.d.ts`: Type declarations for environment variables, ensuring type safety when accessing `import.meta.env`.

## `lib` Directory

This directory contains reusable components, utility functions, and other modules that are not directly tied to specific routes.

### `lib/components`

Contains all Svelte components used throughout the application, organised by their functional area.

- `lib/components/archive/`: Components related to displaying archived content, such as blog posts organised by year and month.
  - `lib/components/archive/ArchiveCard.svelte`: A component for displaying individual archive items (e.g., links).
  - `lib/components/archive/MonthSection.svelte`: Organises and displays content for a specific month within the archive.
  - `lib/components/archive/StatsDisplay.svelte`: Displays statistical information, such as total read time or word count.
  - `lib/components/archive/YearContent.svelte`: Displays content organised by year.
  - `lib/components/archive/YearTabs.svelte`: Provides navigation tabs for different years in the archive.
  - `lib/components/archive/index.ts`: Export file for the archive components.
- `lib/components/icons/`: Contains Svelte components for various icons used across the site.
  - `lib/components/icons/index.ts`: Export file for the icon components.
  - `lib/components/icons/social/`: Icons for social media platforms.
    - `lib/components/icons/social/BlueskyIcon.svelte`: Bluesky social media icon.
    - `lib/components/icons/social/FacebookIcon.svelte`: Facebook social media icon.
    - `lib/components/icons/social/MastodonIcon.svelte`: Mastodon social media icon.
    - `lib/components/icons/social/RedditIcon.svelte`: Reddit social media icon.
    - `lib/components/icons/social/RssIcon.svelte`: RSS feed icon.
    - `lib/components/icons/social/ShareIcons.svelte`: A collection of share icons.
  - `lib/components/icons/utility/`: General utility icons.
    - `lib/components/icons/utility/BookOpenIcon.svelte`: Book open icon.
    - `lib/components/icons/utility/CopyLinkIcon.svelte`: Copy link icon.
    - `lib/components/icons/utility/HomeIcon.svelte`: Home icon.
    - `lib/components/icons/utility/LinkIcon.svelte`: Link icon.
    - `lib/components/icons/utility/MoonIcon.svelte`: Moon icon (often used for dark mode toggle).
    - `lib/components/icons/utility/PostIcon.svelte`: Post icon.
    - `lib/components/icons/utility/SunIcon.svelte`: Sun icon (often used for light mode toggle).
    - `lib/components/icons/utility/BookIcon.svelte`: Book icon.
    - `lib/components/icons/utility/BooksIcon.svelte`: Books icon.
    - `lib/components/icons/utility/ClockIcon.svelte`: Clock icon.
    - `lib/components/icons/utility/CoffeeIcon.svelte`: Coffee icon.
    - `lib/components/icons/utility/DocumentIcon.svelte`: Document icon.
    - `lib/components/icons/utility/EditIcon.svelte`: Edit icon.
    - `lib/components/icons/utility/LinkExternalIcon.svelte`: External link icon.
- `lib/components/layout/`: Components that define the overall structure and layout of the website.
  - `lib/components/layout/Navigation.svelte`: The main navigation bar of the site.
  - `lib/components/layout/ThemeToggle.svelte`: A component to switch between light and dark themes.
  - `lib/components/layout/index.ts`: Export file for layout components.
  - `lib/components/layout/footer/`: Components specific to the website's footer.
    - `lib/components/layout/footer/LastCommit.svelte`: Displays information about the last commit.
    - `lib/components/layout/footer/Main.svelte`: The main footer component, which also displays the ActivityPub user if configured.
    - `lib/components/layout/footer/TidClock.svelte`: Displays a "TID" clock ([a custom time format](https://atproto.com/specs/tid)).
  - `lib/components/layout/main/`: Components for the main content area.
    - `lib/components/layout/main/DynamicLinks.svelte`: Displays dynamically loaded links.
    - `lib/components/layout/main/LatestBlogPost.svelte`: Displays the latest blog post.
    - `lib/components/layout/main/index.ts`: Export file for main layout components.
- `lib/components/post/`: Components for displaying blog posts.
  - `lib/components/post/PostContent.svelte`: Renders the main content of a blog post.
  - `lib/components/post/PostHead.svelte`: Handles metadata and `<svelte:head>` elements for a post.
  - `lib/components/post/PostHeader.svelte`: Displays the header section of a blog post, including title and author information.
  - `lib/components/post/PostNavigation.svelte`: Provides navigation between posts (e.g., previous/next).
  - `lib/components/post/index.ts`: Export file for post components.
- `lib/components/profile/`: Components related to user profile display.
  - `lib/components/profile/Profile.svelte`: Displays the user's profile information.
  - `lib/components/profile/Status.svelte`: Displays the user's current status or "now playing" information.
  - `lib/components/profile/index.ts`: Export file for profile components.
  - `lib/components/profile/profile.ts`: Utility functions for fetching and managing profile data.
- `lib/components/shared/`: General-purpose components or interfaces shared across different parts of the application.
  - `lib/components/shared/NotFoundMessage.svelte`: A component to display when content is not found.
  - `lib/components/shared/index.ts`: Export file for shared components.
  - `lib/components/shared/interfaces.ts`: TypeScript interfaces defining data structures used throughout the application.

### `lib/css`

Contains global CSS styles and variables.

- `lib/css/animations.css`: Defines CSS animations.
- `lib/css/app.css`: Main application-wide CSS styles.
- `lib/css/variables.css`: Defines CSS variables, often used for theming.

### `lib` Top-Level Files

- `lib/parser.ts`: Handles markdown parsing and conversion to HTML, including sanitisation and image URL upgrades.
- `lib/themeLoader.ts`: Manages the loading and application of themes (e.g., light/dark mode).

### `lib/utils`

Contains various utility functions used across the application.

- `lib/utils/cache.ts`: Utility functions for caching data.
- `lib/utils/dateFormatter.ts`: Functions for formatting dates and times.
- `lib/utils/tally.ts`: Utility functions for calculating statistics, such as read time and word count.
- `lib/utils/textProcessor.ts`: Functions for processing text, such as extracting excerpts or counting words.

## `routes` Directory

This directory defines the different pages and RSS API endpoints of the SvelteKit application.

- `routes/+layout.svelte`: The root layout component applied to all pages.
- `routes/+layout.ts`: The root layout load function, fetching data available to all pages.
- `routes/+page.svelte`: The main index page of the website.
- `routes/blog/`: Contains routes and components related to the blog section.
  - `routes/blog/+layout.ts`: Layout load function for blog pages.
  - `routes/blog/+page.svelte`: The main blog index page, listing all posts.
  - `routes/blog/[rkey]/`: Dynamic route for individual blog posts, where `[rkey]` is the unique identifier for a post.
    - `routes/blog/[rkey]/+page.svelte`: Displays the content of a single blog post.
    - `routes/blog/[rkey]/+page.ts`: Load function for fetching data for a single blog post.
  - `routes/blog/rss/`: Contains the RSS feed endpoint for the blog.
    - `routes/blog/rss/+server.ts`: An API endpoint that generates the RSS feed for blog posts.
- `routes/now/`: Contains routes related to the "now" page.
  - `routes/now/+server.ts`: An API endpoint that generates the RSS feed for the "now" statuses.
- `routes/site/meta/`: Contains routes for site metadata and information.
  - `routes/site/meta/+layout.ts`: Layout load function for the site metadata pages.
  - `routes/site/meta/+page.svelte`: Displays information about the website, such as technology stack and privacy policy.