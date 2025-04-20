<script lang="ts">
    import { page } from '$app/stores';
</script>

<svelte:head>
    <title>Ewan's Corner</title>
    <meta name="description" content="Welcome to Ewan's Corner - A personal space where I share my thoughts on coding, technology, and life." />
    <meta name="keywords" content="Ewan, personal website, coding, technology, programming, tech blog, Ewan's Corner" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content={$page.url.origin  + $page.url.pathname} />
    <meta property="og:title" content="Ewan's Corner" />
    <meta property="og:description" content="Welcome to Ewan's Corner - A personal space where I share my thoughts on coding, technology, and life." />
    <meta property="og:site_name" content="Ewan's Corner" />
    <meta property="og:image" content={$page.url.origin + '/embed-preview.png'} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content={$page.url.origin + $page.url.pathname} />
    <meta name="twitter:title" content="Ewan's Corner" />
    <meta name="twitter:description" content="Welcome to Ewan's Corner - A personal space where I share my thoughts on coding, technology, and life." />
    <meta name="twitter:image" content={$page.url.origin + '/embed-preview.png'} />
</svelte:head>

<div class="mb-12 ml-4">
    <h2 class="text-2xl font-bold mb-4 ml-2">Blog</h2>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr)_)] gap-x-4 gap-y-6 mx-2 my-6">
        <div class="post-card">
            <a href="https://blog.ewancroft.uk" target="_blank">
                <div class="flex flex-col h-[110px] justify-between">
                    <p class="text-link leading-[1.5] pb-2 title-truncate font-medium">Personal Blog</p>
                    <div>
                        <p class="text-muted text-sm">URL:</p>
                        <p class="object-bottom text-primary">blog.ewancroft.uk</p>
                    </div>
                </div>
            </a>
        </div>
    </div>
</div>
<div class="mb-12 ml-4">
    <h2 class="text-2xl font-bold mb-4 ml-2">Social Media</h2>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr)_)] gap-x-4 gap-y-6 mx-2 my-6">
        <div class="post-card">
            <a href="https://bsky.app/profile/did:plc:ofrbh253gwicbkc5nktqepol" target="_blank">
                <div class="flex flex-col h-[110px] justify-between">
                    <p class="text-link leading-[1.5] pb-2 title-truncate font-medium">Bluesky</p>
                    <div>
                        <p class="text-muted text-sm">Username:</p>
                        <p class="object-bottom text-primary">@ewancroft.uk</p>
                    </div>
                </div>
            </a>
        </div>
        <div class="post-card">
            <a href="https://tumblr.com/greenwerewolf745" target="_blank">
                <div class="flex flex-col h-[110px] justify-between">
                    <p class="text-link leading-[1.5] pb-2 title-truncate font-medium">Tumblr</p>
                    <div>
                        <p class="text-muted text-sm">Username:</p>
                        <p class="object-bottom text-primary">@greenwerewolf745</p>
                    </div>
                </div>
            </a>
        </div>
        <div class="post-card">
            <a href="https://www.last.fm/user/greenwolf745" target="_blank">
                <div class="flex flex-col h-[110px] justify-between">
                    <p class="text-link leading-[1.5] pb-2 title-truncate font-medium">Last.fm</p>
                    <div>
                        <p class="text-muted text-sm">Username:</p>
                        <p class="object-bottom text-primary">@greenwolf745</p>
                    </div>
                </div>
            </a>
        </div>
    </div>
</div>
<div class="mb-12 ml-4">
    <h2 class="text-2xl font-bold mb-4 ml-2">Development</h2>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr)_)] gap-x-4 gap-y-6 mx-2 my-6">
        <div class="post-card">
            <a href="https://github.com/ewanc26" target="_blank">
                <div class="flex flex-col h-[110px] justify-between">
                    <p class="text-link leading-[1.5] pb-2 title-truncate font-medium">GitHub</p>
                    <div>
                        <p class="text-muted text-sm">Username:</p>
                        <p class="object-bottom text-primary">ewanc26</p>
                    </div>
                </div>
            </a>
        </div>
        <div class="post-card">
            <a href="https://tangled.sh/did:plc:ofrbh253gwicbkc5nktqepol" target="_blank">
                <div class="flex flex-col h-[110px] justify-between">
                    <p class="text-link leading-[1.5] pb-2 title-truncate font-medium">Tangled</p>
                    <div>
                        <p class="text-muted text-sm">Username:</p>
                        <p class="object-bottom text-primary">ewancroft.uk</p>
                    </div>
                </div>
            </a>
        </div>
    </div>
</div>