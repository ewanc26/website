<script lang="ts">
  // The profile object is passed as a prop to this component.
  export let profile: any;
  import { Status } from ".";
</script>

<!-- Profile Banner: Displays the user's banner image. -->
<div
  class="profile-banner p-4 relative rounded-[1em] mx-2 mb-2"
  style="background-image: url({profile?.banner}); background-size: cover; background-position: center; min-height: 150px;"
></div>

{#if profile}
  <!-- Profile Content: Main container for avatar, user info, and status. -->
  <div class="profile-content flex flex-row items-start text-left mx-2 mb-8 relative gap-6">
    <!-- Profile Avatar (overlapping the banner) -->
    <img
      src={profile?.avatar}
      alt="{profile?.displayName || 'User'}'s avatar"
      class="rounded-full w-32 h-32 shadow-lg hover:transform-none flex-shrink-0 -mt-16 relative z-10"
    />
    
    <!-- User Information: Display name, handle, DID, description, status -->
    <div class="flex-1 min-w-0 p-4 rounded-[1em] overflow-hidden" style="background: var(--card-bg);">
      <div class="mb-3">
        <h4 class="text-lg font-semibold mb-1 leading-tight truncate">{profile?.displayName}</h4>
        <h6 class="mb-2">
          <a
            href="https://bsky.app/profile/{profile?.handle}"
            class="text-link hover:text-link-hover text-sm truncate block">@{profile?.handle}</a
          >
        </h6>
        <h6 class="opacity-40 mb-3">
          <span class="text-xs font-mono overflow-hidden text-ellipsis whitespace-nowrap hidden sm:block">{profile?.did}</span>
        </h6>
      </div>
      
      <!-- Profile Description -->
      {#if profile?.description}
        <div class="mb-3">
          <p class="text-sm leading-relaxed">{profile?.description}</p>
        </div>
      {/if}
      
      <!-- Display consolidated status/music using the updated Status component -->
      <Status {profile} />
    </div>
  </div>
{:else}
  <!-- Placeholder for app.bsky.actor.profile -->
  <div
    class="profile-content flex flex-col items-center justify-center text-center mx-2 p-4 relative rounded-[1em]"
    style="background: var(--card-bg);"
  >
    <p class="text-center text-sm italic opacity-75">
      create a `app.bsky.actor.profile` record at <a
        href="https://bsky.app/"
        class="text-link hover:text-link-hover">https://bsky.app/</a
      >
    </p>
  </div>
{/if}