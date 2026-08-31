<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { consumeReaderReturnTo, initReaderSession } from '$lib/services/atproto/commentClient';

    let error = $state('');

    onMount(() => {
        void (async () => {
            try {
                const session = await initReaderSession();
                if (!session) throw new Error('No AT Protocol OAuth session was returned.');
                await goto(consumeReaderReturnTo(), { replaceState: true });
            } catch (cause) {
                error = cause instanceof Error ? cause.message : 'AT Protocol sign-in failed.';
            }
        })();
    });
</script>

<svelte:head><title>Signing in…</title></svelte:head>

<main class="shell-prose">
    <section class="prose">
        <h1>Signing in to comment</h1>
        {#if error}
            <p role="alert">{error}</p>
            <p><a href="/blog">Return to the blog</a></p>
        {:else}
            <p>Completing your AT Protocol OAuth session…</p>
        {/if}
    </section>
</main>
