<script lang="ts">
  import ProfileCard from '$lib/components/ProfileCard.svelte';
  import StatusCard from '$lib/components/StatusCard.svelte';
  import { siteMeta } from '$lib/helper/siteMeta';
</script>

<div class="max-w-4xl mx-auto space-y-6">
  <div class="text-center mb-8">
    <h1 class="text-4xl md:text-5xl font-bold text-text-900 dark:text-text-50 mb-4">
      Welcome to {siteMeta.title}
    </h1>
    <p class="text-lg text-text-700 dark:text-text-300 max-w-2xl mx-auto">
      {siteMeta.description}
    </p>
  </div>

  <!-- Profile Card (loads second, larger data) -->
  <ProfileCard />
  
  <!-- Status Card (loads first, smaller data) -->
  <StatusCard />
</div>