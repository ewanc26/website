<script lang="ts">
  import { getStores } from '$app/stores';
  const { page } = getStores();
  
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/blog', label: 'Blog' },
    { href: '/site/meta', label: 'Site Meta' }
  ];

  import { siteMeta } from '$lib/helper/siteMeta';
</script>

<header class="sticky top-0 z-50 bg-background-50/90 dark:bg-background-900/90 backdrop-blur-md border-b border-background-200 dark:border-background-800">
  <nav class="container mx-auto px-4 py-4">
    <div class="flex items-center justify-between">
      <!-- Logo/Brand -->
      <a href="/" class="flex items-center gap-2 group">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-primary font-bold transition-transform duration-200 group-hover:scale-110">
          E
        </div>
        <span class="text-xl font-bold text-text-900 dark:text-text-50">
          {siteMeta.title}
        </span>
      </a>

      <!-- Navigation -->
      <ul class="flex items-center gap-6">
        {#each navItems as item}
          <li>
            <a
              href={item.href}
              class="text-text-700 dark:text-text-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 font-medium"
              class:text-primary-600={$page.url.pathname === item.href}
              class:dark:text-primary-400={$page.url.pathname === item.href}
            >
              {item.label}
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </nav>
</header>