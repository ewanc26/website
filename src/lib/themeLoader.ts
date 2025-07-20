import type { Theme } from "./components/shared/interfaces";

// Theme configuration - single source of truth
export const THEMES: Theme[] = [
  { id: "default", name: "Green (Default)" },
  { id: "blue", name: "Blue" },
  { id: "purple", name: "Purple" },
  { id: "bubblegum", name: "Bubblegum" },
  { id: "slate", name: "Slate" },
  { id: "sand", name: "Sand" },
  { id: "ocean", name: "Ocean" },
  { id: "sunset", name: "Sunset" },
  { id: "mint", name: "Mint" },
  { id: "lavender", name: "Lavender" },
  { id: "rose", name: "Rose" },
  { id: "amber", name: "Amber" },
  { id: "teal", name: "Teal" },
  { id: "olive", name: "Olive" },
  { id: "indigo", name: "Indigo" },
  { id: "coral", name: "Coral" },
  { id: "charcoal", name: "Charcoal" },
  { id: "wood", name: "Wood" },
  { id: "high-contrast", name: "High Contrast (Accessibility)" },
  { id: "low-contrast", name: "Low Contrast (Accessibility)" },
];

export const THEME_STORAGE_KEYS = {
  MODE: "theme-mode",
  COLOR: "color-theme",
} as const;

export type ThemeMode = "light" | "dark";

/**
 * Applies theme classes to the document element
 */
export function applyTheme(isDarkMode: boolean, themeId: string): void {
  // Remove all existing theme classes
  document.documentElement.classList.remove("light");
  THEMES.forEach((theme) => {
    if (theme.id !== "default") {
      document.documentElement.classList.remove(theme.id);
    }
  });

  // Apply light mode class if needed
  if (!isDarkMode) {
    document.documentElement.classList.add("light");
  }

  // Apply color theme class if not default
  if (themeId !== "default") {
    document.documentElement.classList.add(themeId);
  }
}

/**
 * Gets the user's theme preferences from localStorage and system
 */
export function getThemePreferences(): { isDarkMode: boolean; themeId: string } {
  const savedThemeMode = localStorage.getItem(THEME_STORAGE_KEYS.MODE);
  const savedColorTheme = localStorage.getItem(THEME_STORAGE_KEYS.COLOR);

  let isDarkMode: boolean;
  if (savedThemeMode) {
    isDarkMode = savedThemeMode === "dark";
  } else {
    // Use system preference as default
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    isDarkMode = prefersDark;
  }

  const themeId = savedColorTheme || "default";

  return { isDarkMode, themeId };
}

/**
 * Saves theme preferences to localStorage
 */
export function saveThemePreferences(isDarkMode: boolean, themeId: string): void {
  localStorage.setItem(THEME_STORAGE_KEYS.MODE, isDarkMode ? "dark" : "light");
  localStorage.setItem(THEME_STORAGE_KEYS.COLOR, themeId);
}

/**
 * Updates the theme-color meta tag for browser UI
 */
export function updateThemeColorMeta(): void {
  const themeColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--background-color")
    .trim();

  let metaTag = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
  if (!metaTag) {
    metaTag = document.createElement("meta");
    metaTag.setAttribute("name", "theme-color");
    document.head.appendChild(metaTag);
  }
  metaTag.setAttribute("content", themeColor);
}

/**
 * Dispatches a custom event when theme changes
 */
export function dispatchThemeChangeEvent(isDarkMode: boolean, themeId: string): void {
  document.dispatchEvent(
    new CustomEvent("themeChanged", {
      detail: { isDarkMode, theme: themeId },
    })
  );
}

/**
 * Sets up system theme change listener
 */
export function setupSystemThemeListener(): void {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      // Only apply system preference if user hasn't set a manual preference
      if (localStorage.getItem(THEME_STORAGE_KEYS.MODE) === null) {
        const { themeId } = getThemePreferences();
        applyTheme(e.matches, themeId);
        updateThemeColorMeta();
        dispatchThemeChangeEvent(e.matches, themeId);
      }
    });
}

/**
 * Initializes theme system - should be called as early as possible
 */
export function initializeTheme(): void {
  const { isDarkMode, themeId } = getThemePreferences();
  applyTheme(isDarkMode, themeId);
  
  // Update meta tag when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateThemeColorMeta);
  } else {
    updateThemeColorMeta();
  }
}

// Auto-initialize when script loads (for inline usage)
if (typeof window !== "undefined") {
  initializeTheme();
}