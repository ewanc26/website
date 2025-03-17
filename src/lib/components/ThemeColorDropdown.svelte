<script lang="ts">
    import { onMount } from 'svelte';
  
    // Theme color options
    const colorThemes = [
      { name: 'default', label: 'Green' },
      { name: 'red', label: 'Red' },
      { name: 'blue', label: 'Blue' },
      { name: 'yellow', label: 'Yellow' },
      { name: 'orange', label: 'Orange' },
      { name: 'indigo', label: 'Indigo' },
      { name: 'violet', label: 'Violet' }
    ];
  
    // State
    let isOpen = false;
    let currentTheme = 'default';
  
    // Toggle dropdown
    function toggleDropdown() {
      isOpen = !isOpen;
    }
  
    // Close dropdown if clicked outside
    function handleClickOutside(event: MouseEvent) {
      const dropdown = document.querySelector('.theme-color-dropdown');
      if (dropdown && !dropdown.contains(event.target as Node)) {
        isOpen = false;
      }
    }
  
    // Apply theme color
    function setThemeColor(themeName: string) {
      // Remove all theme classes
      colorThemes.forEach(theme => {
        if (theme.name !== 'default') {
          document.documentElement.classList.remove(theme.name);
        }
      });
  
      // Add new theme class if not default
      if (themeName !== 'default') {
        document.documentElement.classList.add(themeName);
      }
  
      // Save preference
      localStorage.setItem('colorTheme', themeName);
      
      // Update current theme and close dropdown
      currentTheme = themeName;
      isOpen = false;
    }
  
    onMount(() => {
      // Add click outside listener
      document.addEventListener('click', handleClickOutside);
  
      // Check for saved color theme
      const savedColorTheme = localStorage.getItem('colorTheme');
      if (savedColorTheme) {
        currentTheme = savedColorTheme;
      }
  
      // Cleanup on destroy
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    });
  </script>
  
  <div class="theme-color-dropdown">
    <button 
      class="dropdown-toggle" 
      on:click={toggleDropdown}
      aria-label="Change color theme" 
      aria-expanded={isOpen}
      aria-controls="theme-color-menu"
    >
      <span class="color-dot {currentTheme}"></span>
      <span class="label">Theme</span>
    </button>
  
    {#if isOpen}
      <div class="dropdown-menu" id="theme-color-menu" role="menu">
        {#each colorThemes as theme}
          <button 
            class="dropdown-item" 
            on:click={() => setThemeColor(theme.name)}
            aria-current={currentTheme === theme.name}
          >
            <span class="color-dot {theme.name}"></span>
            <span>{theme.label}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
  
  <style>
    .theme-color-dropdown {
      position: relative;
      display: inline-block;
    }
  
    .dropdown-toggle {
      display: flex;
      align-items: center;
      background-color: var(--color-button);
      color: var(--color-text);
      border: none;
      border-radius: 2rem;
      padding: 0.5rem 1rem;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background-color 0.2s, transform 0.1s;
    }
  
    .dropdown-toggle:hover {
      background-color: var(--color-button-hover);
    }
  
    .dropdown-toggle:active {
      transform: scale(0.95);
    }
  
    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      z-index: 1000;
      width: 150px;
      margin-top: 0.5rem;
      background-color: var(--color-header-footer);
      border-radius: 0.5rem;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  
    .dropdown-item {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 0.75rem 1rem;
      border: none;
      background: none;
      color: var(--color-text);
      cursor: pointer;
      text-align: left;
      transition: background-color 0.2s;
    }
  
    .dropdown-item:hover {
      background-color: var(--color-embed);
    }
  
    .dropdown-item[aria-current="true"] {
      font-weight: bold;
      background-color: var(--color-embed);
    }
  
    .color-dot {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      margin-right: 0.75rem;
      border: 2px solid var(--color-text);
    }
  
    .color-dot.default {
      background-color: #91c991;
    }
  
    .color-dot.red {
      background-color: #f8c2c2;
    }
  
    .color-dot.blue {
      background-color: #c2d9f8;
    }
  
    .color-dot.yellow {
      background-color: #fff6c2;
    }
  
    .color-dot.orange {
      background-color: #f8e4d1;
    }
  
    .color-dot.indigo {
      background-color: #d1d0f8;
    }
  
    .color-dot.violet {
      background-color: #f0d1f8;
    }
     
    .label {
      font-weight: 500;
    }
  
    @media (max-width: 600px) {
      .dropdown-toggle {
        padding: 0.4rem 0.8rem;
        font-size: 0.8rem;
      }
      
      .label {
        display: none;
      }
      
      .color-dot {
        margin-right: 0;
      }
    }
  </style>