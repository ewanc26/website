<script lang="ts">
  import { page } from '$app/stores';
  // If your project uses the standard SvelteKit page store reactive rune:
  // import { page } from '$app/state'; 
</script>

<main class="shell-narrow error-layout">
  <div class="panel error-card">
    <div class="panel-head">
      <span class="error-badge">STATUS // {$page.status}</span>
    </div>
    
    <div class="panel-body">
      <h1 class="error-title">
        {$page.status === 404 ? 'Route Not Found' : ($page.error?.message ?? 'An Unexpected Error Occurred')}
      </h1>
      
      <p class="error-desc">
        {$page.status === 404 
          ? 'The requested page could not be located. It may have been moved, deleted, or the URL slug might contain a typo.' 
          : 'The system encountered an unhandled exception while attempting to build this view.'}
      </p>

      {#if $page.error?.stack}
        <details class="error-details">
          <summary>EXCEPTION_TRACE</summary>
          <pre><code>{$page.error.stack}</code></pre>
        </details>
      {/if}

      <div class="error-actions">
        <a href="/" class="brand-btn">Return to Homepage</a>
        <a href="/projects" class="brand-btn-secondary">View Projects</a>
      </div>
    </div>
  </div>
</main>

<style>
  .error-layout {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - var(--space-2xl) * 2);
    padding: var(--space-xl) var(--space-md);
  }

  .error-card {
    width: 100%;
    border-radius: var(--radius-lg);
    box-shadow: 0 4px 24px -4px rgba(0, 0, 0, 0.04);
  }

  .panel-body {
    padding: var(--space-xl);
  }

  .error-badge {
    font-family: var(--font-mono);
    font-weight: 700;
    color: var(--color-primary-600);
    letter-spacing: 0.05em;
  }

  .error-title {
    margin-top: 0;
    margin-bottom: var(--space-sm);
    font-size: var(--text-xl);
    font-weight: 800;
    letter-spacing: -0.025em;
    color: var(--color-ink-950);
  }

  .error-desc {
    margin-top: 0;
    margin-bottom: var(--space-xl);
    color: var(--color-ink-700);
    font-size: var(--text-md);
    line-height: 1.6;
    max-width: 55ch;
  }

  /* --- Brand Kit Buttons --- */
  .error-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-md);
  }

  .brand-btn, .brand-btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-sm) var(--space-lg);
    font-size: var(--text-sm);
    font-weight: 600;
    text-decoration: none;
    border-radius: var(--radius-md);
    transition: background-color var(--duration-fast) var(--ease-out-quart),
                color var(--duration-fast) var(--ease-out-quart),
                border-color var(--duration-fast) var(--ease-out-quart);
  }

  .brand-btn {
    background-color: var(--color-primary-600);
    color: var(--color-canvas-50);
  }

  .brand-btn:hover {
    background-color: var(--color-primary-500);
  }

  .brand-btn-secondary {
    background-color: var(--surface-raised);
    border: 1px solid var(--surface-color);
    color: var(--color-ink-800);
  }

  .brand-btn-secondary:hover {
    background-color: var(--surface-color);
    color: var(--color-ink-950);
  }

  /* --- Diagnostic Debug Logs --- */
  .error-details {
    margin-bottom: var(--space-xl);
    border: 1px solid var(--surface-color);
    background-color: var(--surface-sunken);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .error-details summary {
    padding: var(--space-sm) var(--space-md);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--color-ink-600);
    background-color: var(--surface-raised);
    cursor: pointer;
    user-select: none;
    border-bottom: 1px solid var(--surface-color);
  }

  .error-details summary:hover {
    color: var(--color-ink-950);
  }

  .error-details pre {
    margin: 0;
    padding: var(--space-md);
    overflow-x: auto;
  }

  .error-details code {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-accent-600);
    white-space: pre-wrap;
    word-break: break-all;
  }
</style>
