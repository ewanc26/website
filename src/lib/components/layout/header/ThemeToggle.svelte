<script lang="ts">
  import { onMount } from "svelte";
  import { SunIcon, MoonIcon } from "$components/icons";
  import EditIcon from "$components/icons/utility/EditIcon.svelte";
  import { 
    THEMES,
    applyTheme, 
    getThemePreferences, 
    saveThemePreferences,
    updateThemeColorMeta,
    dispatchThemeChangeEvent,
    setupSystemThemeListener
  } from "../../../themeLoader";

  let isDarkMode: boolean = true;
  let currentTheme: string = "default";
  let isDropdownOpen: boolean = false;

  onMount(() => {
    // Retrieve current theme preferences (already applied by theme-loader)
    const preferences = getThemePreferences();
    isDarkMode = preferences.isDarkMode;
    currentTheme = preferences.themeId;

    // Update meta tag and dispatch a theme change event
    updateThemeColorMeta();
    dispatchThemeChangeEvent(isDarkMode, currentTheme);

    // Set up system theme listener
    setupSystemThemeListener();

    // Close dropdown when clicking outside the theme controls
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
    saveThemePreferences(isDarkMode, currentTheme);
    updateThemeColorMeta();
    dispatchThemeChangeEvent(isDarkMode, currentTheme);
  }

  // Change the colour theme
  function changeColorTheme(themeId: string): void {
    currentTheme = themeId;
    applyTheme(isDarkMode, currentTheme);
    saveThemePreferences(isDarkMode, currentTheme);
    updateThemeColorMeta();
    dispatchThemeChangeEvent(isDarkMode, currentTheme);
    isDropdownOpen = false;
  }

  // Toggle the dropdown for theme selection
  function toggleDropdown(e: MouseEvent): void {
    e.stopPropagation();
    isDropdownOpen = !isDropdownOpen;
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
      <EditIcon size="20" stroke="var(--text-color)" />
    </button>

    <button
      onclick={toggleTheme}
      class="icon-button p-2 rounded-full transition-all duration-300 hover:scale-110"
      style="background-color: var(--card-bg);"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {#if isDarkMode}
        <!-- Sun icon for switching to light mode -->
        <SunIcon stroke="var(--text-color)" />
      {:else}
        <!-- Moon icon for switching to dark mode -->
        <MoonIcon stroke="var(--text-color)" />
      {/if}
    </button>
  </div>

  {#if isDropdownOpen}
    <div
      class="theme-dropdown absolute right-0 mt-2 py-2 w-48 rounded shadow-lg z-10"
      style="background-color: var(--card-bg); border: 1px solid var(--button-bg);"
    >
      <div class="max-h-80 overflow-y-auto">
        {#each THEMES as theme}
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
    z-index: 100;
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .theme-dropdown {
      width: 12rem;
      right: 0;
    }
  }
</style>