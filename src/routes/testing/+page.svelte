<script lang="ts">
    import { sabbatTimeTest } from './tests/sabbat-time.test';
    import type { TestResult } from './tests/types';

    let { data } = $props();
    let results = $state<Record<string, TestResult>>({});

    const tests = [sabbatTimeTest];

    async function runTest(test: typeof tests[0]) {
        results[test.name] = { success: false, message: 'Running...' };
        results[test.name] = await test.run();
    }
</script>

<h1>Testing Suite</h1>
<p>{data.message}</p>

<section style="margin-top: 2rem;">
    <h2>Test Runner</h2>
    <div style="display: flex; flex-direction: column; gap: 1rem;">
        {#each tests as test}
            <div style="border: 1px solid var(--surface-color); padding: 1rem; border-radius: var(--radius-md);">
                <h3>{test.name}</h3>
                <p>{test.description}</p>
                <button onclick={() => runTest(test)}>Run Test</button>
                
                {#if results[test.name]}
                    <p style="color: {results[test.name].success ? 'green' : 'red'}; margin-top: 0.5rem;">
                        {results[test.name].message}
                    </p>
                {/if}
            </div>
        {/each}
    </div>
</section>

