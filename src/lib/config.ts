import { PUBLIC_SITE_TITLE, PUBLIC_SITE_DESCRIPTION } from "$env/static/public";

export const SITE = {
  title: PUBLIC_SITE_TITLE || "Ewan Croft",
  ogTitle: "Ewan Croft — Anglo-Scottish Pagan, Poet, and Programmer",
  description:
    PUBLIC_SITE_DESCRIPTION ||
    "The personal website of Ewan Croft — an Anglo-Scottish pagan, poet, and software engineer. Exploring the intersections of tradition, technology, and creativity.",
};

export const NAV_LINKS = [
  { label: "About", url: "/about" },
  { label: "Blog", url: "/blog" },
  { label: "Projects", url: "https://docs.ewancroft.uk" },
  { label: "Support", url: "/support" },
  { label: "Subscriptions", url: "/subscriptions" },
  { label: "Meta", url: "/site/meta" },
];
