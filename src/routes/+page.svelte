<script lang="ts">
  import { DynamicLinks } from '$lib/components/layout';
  import { ProfileCard, StatusCard } from '$lib/components/layout/main/card';
  import { siteMeta } from '$lib/helper';
</script>

<div class="mx-auto max-w-6xl">
  <div class="mb-8 text-center">
    <h1 class="mb-4 text-4xl font-bold text-ink-900 md:text-5xl dark:text-ink-50">
      Welcome to {siteMeta.title}
    </h1>
    <p class="mx-auto max-w-2xl text-lg text-ink-700 dark:text-ink-300">
      {siteMeta.description}
    </p>
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <!-- Left Column -->
    <div class="space-y-6">
      <!-- Profile Card (loads second, larger data) -->
      <ProfileCard />

      <!-- Status Card (loads first, smaller data) -->
      <StatusCard />
    </div>

    <!-- Right Column -->
    <div class="space-y-6">
      <!-- Dynamic Links (loads third, larger data) -->
      <DynamicLinks />
    </div>
  </div>
</div>