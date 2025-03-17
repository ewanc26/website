<script lang="ts">
    import ThemeColorDropdown from './ThemeColorDropdown.svelte';
    import ThemeToggle from './ThemeToggle.svelte';
    import websiteInfo from '$lib/data/website.json';
  </script>
  
  <nav class="navigation">
    <div class="container">
      <div class="nav-content">
        <a href="/" class="nav-logo">{websiteInfo.title}</a>
        
        <div class="nav-controls">
          <ThemeColorDropdown />
          <ThemeToggle />
        </div>
      </div>
    </div>
  </nav>
  
  <style>
    .navigation {
      background-color: var(--color-header-footer);
      padding: 1rem 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }
  
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
  
    .nav-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  
    .nav-logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-text);
      text-decoration: none;
    }
  
    .nav-controls {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
  
    @media (max-width: 600px) {
      .nav-logo {
        font-size: 1.2rem;
      }
      
      .nav-controls {
        gap: 0.5rem;
      }
    }
  </style>