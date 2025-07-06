<script lang="ts">
  // The profile object is passed as a prop to this component.
  export let profile: any;
  import { Status, RecentFM } from ".";
</script>

<!-- Profile Banner: Displays the user's banner image. -->
<div
  class="profile-banner p-4 relative rounded-[1em] m-2 mb-6"
  style="background-image: url({profile?.banner}); background-size: cover; background-position: center; min-height: 150px;"
></div>

{#if profile}
  <!-- Profile Content: Main container for avatar, user info, and status. -->
  <div
    class="profile-content flex flex-col items-center justify-center text-center m-2 p-4 -mt-20 ml-4 mr-4 relative rounded-[1em]"
  >
    <!-- Profile Avatar -->
    <img
      src={profile?.avatar}
      alt="{profile?.displayName || 'User'}'s avatar"
      class="rounded-full w-32 h-32 -mt-2 shadow-lg hover:transform-none"
    />
    <!-- User Information: Display name, handle, DID. -->
    <div class="text-center p-2">
      <h4 class="text-center text-lg font-semibold mb-1">{profile?.displayName}</h4>
      <h6 class="text-center mb-1">
        <a
          href="https://bsky.app/profile/{profile?.did}"
          class="text-link hover:text-link-hover text-sm">@{profile?.handle}</a
        >
      </h6>
      <h6 class="text-center opacity-40 mb-2">
        <span class="text-xs">{profile?.did}</span>
      </h6>
      <!-- Profile Description -->
      <div class="p-1 w-full text-center mb-2">
        <p class="text-sm">{profile?.description}</p>
      </div>
      <!-- Display the latest "now" status using the Status component. -->
      <Status {profile} />
      
      <!-- RecentFM Integration -->
      <RecentFM nomoji={true} displayName={profile?.displayName || 'User'} />
    </div>
  </div>
{:else}
  <!-- Placeholder for app.bsky.actor.profile -->
  <div
    class="profile-content flex flex-col items-center justify-center text-center m-2 p-4 -mt-20 ml-4 mr-4 relative rounded-[1em]"
  >
    <p class="text-center text-sm italic opacity-75">
      create a `app.bsky.actor.profile` record at <a
        href="https://bsky.app/"
        class="text-link hover:text-link-hover">https://bsky.app/</a
      >
    </p>
  </div>
{/if}