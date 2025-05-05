<script lang="ts">
  import { onMount } from "svelte";

  let isDarkMode: boolean = true;
  let currentTheme: string = "default";
  let isDropdownOpen: boolean = false;

  const themes = [
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

  onMount(() => {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem("theme-mode");
    const savedColorTheme = localStorage.getItem("color-theme");

    if (savedTheme) {
      isDarkMode = savedTheme === "dark";
    } else {
      // Use system preference as default
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      isDarkMode = prefersDark;
    }

    if (savedColorTheme) {
      currentTheme = savedColorTheme;
    }

    applyTheme(isDarkMode, currentTheme);

    // Listen for system theme changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (localStorage.getItem("theme-mode") === null) {
          isDarkMode = e.matches;
          applyTheme(isDarkMode, currentTheme);
        }
      });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e: MouseEvent) => {
      const themeControls = document.querySelector(".theme-controls");
      if (
        isDropdownOpen &&
        themeControls &&
        !e.composedPath().includes(themeControls)
      ) {
        isDropdownOpen = false;
      }
    });
  });

  function toggleTheme(): void {
    isDarkMode = !isDarkMode;
    applyTheme(isDarkMode, currentTheme);
    localStorage.setItem("theme-mode", isDarkMode ? "dark" : "light");
  }

  function changeColorTheme(themeId: string): void {
    currentTheme = themeId;
    applyTheme(isDarkMode, currentTheme);
    localStorage.setItem("color-theme", currentTheme);
    isDropdownOpen = false;
  }

  function toggleDropdown(e: MouseEvent): void {
    e.stopPropagation();
    isDropdownOpen = !isDropdownOpen;
  }

  function applyTheme(dark: boolean, theme: string): void {
    // First, remove all theme classes
    document.documentElement.classList.remove("light");
    themes.forEach((t) => {
      if (t.id !== "default") {
        document.documentElement.classList.remove(t.id);
      }
    });

    // Then apply the selected theme
    if (!dark) {
      document.documentElement.classList.add("light");
    }

    if (theme !== "default") {
      document.documentElement.classList.add(theme);
    }

    // Update theme-color meta tag for browser tab colors
    const themeColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--background-color");

    let metaTag = document.querySelector('meta[name="theme-color"]');
    if (!metaTag) {
      metaTag = document.createElement("meta");
      metaTag.setAttribute("name", "theme-color");
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute("content", themeColor);

    // Dispatch a custom event to notify other components about theme change
    document.dispatchEvent(
      new CustomEvent("themeChanged", {
        detail: { isDarkMode: dark, theme: theme },
      })
    );
  }
</script>

<div class="theme-controls relative">
  <div class="flex items-center gap-2">
    <button
      onclick={toggleDropdown}
      class="icon-button p-2 rounded-full transition-all duration-300 hover:scale-110"
      style="background-color: var(--card-bg);"
      aria-label="Change theme"
      aria-expanded={isDropdownOpen}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--text-color)"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M20.71 4.04a1 1 0 0 1 .02 1.39l-9.6 9.6c-.1.1-.21.18-.33.24l-3.76 1.25a1 1 0 0 1-1.27-1.27l1.25-3.76c.06-.12.14-.23.24-.33l9.6-9.6a1 1 0 0 1 1.41.02z"
        ></path>
        <path d="M14 7l3 3"></path>
        <path d="M5 16l-2 4 4-2z"></path>
      </svg>
    </button>

    <button
      onclick={toggleTheme}
      class="icon-button p-2 rounded-full transition-all duration-300 hover:scale-110"
      style="background-color: var(--card-bg);"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {#if isDarkMode}
        <!-- Sun icon for light mode -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-color)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="feather feather-sun"
        >
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      {:else}
        <!-- Moon icon for dark mode -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-color)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="feather feather-moon"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      {/if}
    </button>
  </div>

  {#if isDropdownOpen}
    <div
      class="theme-dropdown absolute right-0 mt-2 py-2 w-48 rounded shadow-lg z-10"
      style="background-color: var(--card-bg); border: 1px solid var(--button-bg);"
    >
      <div class="max-h-80 overflow-y-auto">
        {#each themes as theme}
          <button
            class="theme-option w-full text-left px-4 py-2 transition-colors duration-200"
            class:active={currentTheme === theme.id}
            onclick={() => changeColorTheme(theme.id)}
          >
            {theme.name}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  /* Common icon styling */
  .icon-button {
    color: var(--text-color);
  }

  .icon-button:hover {
    background-color: var(--button-hover-bg) !important;
  }

  .theme-option {
    color: var(--text-color);
  }

  .theme-option:hover {
    background-color: var(--button-bg);
  }

  .theme-option.active {
    background-color: var(--button-hover-bg);
    font-weight: 500;
  }

  .theme-dropdown {
    max-height: 80vh;
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .theme-dropdown {
      width: 12rem;
      right: 0;
    }
  }
</style>
