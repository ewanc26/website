<script lang="ts">
    const { profile } = $props()
</script>

{#if profile.banner}
    <div class="profile-banner p-4 relative rounded-[1em] m-2 mb-6" style="background-image: url({profile.banner}); background-size: cover; background-position: center; min-height: 150px;">
    </div>
{/if}

<div class="profile-content flex flex-col items-center justify-center text-center m-2 p-4 {!profile.banner ? 'mt-6' : ''} ml-4 mr-4 relative rounded-[1em]">
    {#if profile.avatar}
        <img src={profile.avatar} alt="Bluesky avatar" class="rounded-full w-32 h-32 -mt-2 shadow-lg hover:transform-none"/>
    {/if}

    <div class="text-center p-3">
        {#if profile.displayName}
            <h4 class="text-center">{profile.displayName}</h4>
        {/if}
        {#if profile.handle}
            <h6 class="text-center text-[#8bd5a0] hover:text-[#b7e6c4] hover:underline">
                <a href="https://bsky.app/profile/{profile.handle}">@{profile.handle}</a>
            </h6>
        {/if}
    </div>

    {#if profile.description}
        <div class="p-3 w-full text-center">
            <p>{profile.description}</p>
        </div>
    {/if}
</div>