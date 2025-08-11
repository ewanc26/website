// Inline theme loader - compiled from themeLoader.ts
// This runs immediately when the script loads
(function() {
  'use strict';
  
  // Theme configuration - single source of truth
  const THEMES = [
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
    { id: "werewolf", name: "Werewolf" },
    { id: "high-contrast", name: "High Contrast (Accessibility)" },
    { id: "low-contrast", name: "Low Contrast (Accessibility)" },
  ];

  const THEME_STORAGE_KEYS = {
    MODE: "theme-mode",
    COLOR: "color-theme",
  };

  // Cache DOM element for better performance
  const docElement = document.documentElement;
  const themeClassList = docElement.classList;

  /**
   * Applies theme classes to the document element
   */
  function applyTheme(isDarkMode, themeId) {
    // Remove all existing theme classes efficiently
    themeClassList.remove("light");
    
    // Only remove non-default themes to reduce DOM operations
    if (themeId !== "default") {
      THEMES.forEach((theme) => {
        if (theme.id !== "default") {
          themeClassList.remove(theme.id);
        }
      });
    }

    // Apply light mode class if needed
    if (!isDarkMode) {
      themeClassList.add("light");
    }

    // Apply color theme class if not default
    if (themeId !== "default") {
      themeClassList.add(themeId);
    }
  }

  /**
   * Gets the user's theme preferences from localStorage and system
   */
  function getThemePreferences() {
    const savedThemeMode = localStorage.getItem(THEME_STORAGE_KEYS.MODE);
    const savedColorTheme = localStorage.getItem(THEME_STORAGE_KEYS.COLOR);

    let isDarkMode;
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
   * Initializes theme system - runs immediately
   */
  function initializeTheme() {
    const { isDarkMode, themeId } = getThemePreferences();
    applyTheme(isDarkMode, themeId);
  }

  // Initialize theme immediately
  initializeTheme();
  
  // Make theme functions available globally for the Svelte component
  window.__themeLoader = {
    THEMES,
    THEME_STORAGE_KEYS,
    applyTheme,
    getThemePreferences,
    initializeTheme
  };
})();