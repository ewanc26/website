<script lang="ts">
  const { profile } = $props();
</script>

<div
  class="profile-banner p-4 relative rounded-[1em] m-2 mb-6"
  style="background-image: url({profile.banner}); background-size: cover; background-position: center; min-height: 150px;"
></div>
<div
  class="profile-content flex flex-col items-center justify-center text-center m-2 p-4 -mt-20 ml-4 mr-4 relative rounded-[1em]"
>
  <img
    src={profile.avatar}
    alt="Bluesky avatar"
    class="rounded-full w-32 h-32 -mt-2 shadow-lg hover:transform-none"
  />
  <div class="text-center p-3">
    <h4 class="text-center">{profile.displayName}</h4>
    <h6 class="text-center text-[#8bd5a0] hover:text-[#b7e6c4] hover:underline">
      <a href="https://bsky.app/profile/{profile.handle}">@{profile.handle}</a>
    </h6>
  </div>
  <div class="p-3 w-full text-center">
    <p>{profile.description}</p>
  </div>
</div>
