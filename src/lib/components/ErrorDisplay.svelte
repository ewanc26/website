<script lang="ts">
  import { AlertCircle } from '@lucide/svelte';

  interface Props {
    status?: number;
    title?: string;
    message?: string;
    details?: string;
  }

  let { status = 500, title, message, details }: Props = $props();

  const defaultTitles: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Server Error',
    501: 'Service Unavailable',
    503: 'Service Unavailable',
  };

  const defaultMessages: Record<number, string> = {
    400: 'The request was malformed or invalid.',
    401: 'You need to authenticate to access this resource.',
    403: 'You do not have permission to access this resource.',
    404: 'The page or resource you requested could not be found.',
    500: 'Something went wrong on our end. Please try again later.',
    501: 'This service is temporarily unavailable.',
    503: 'The service is temporarily unavailable. Please try again later.',
  };

  const displayTitle = $derived(title || defaultTitles[status] || 'Error');
  const displayMessage = $derived(message || defaultMessages[status] || 'An unexpected error occurred.');
</script>

<div class="error-container">
  <div class="error-icon">
    <AlertCircle size={48} />
  </div>

  <div class="error-content">
    <h1 class="error-code">{status}</h1>
    <h2 class="error-title">{displayTitle}</h2>
    <p class="error-message">{displayMessage}</p>

    {#if details}
      <div class="error-details">{details}</div>
    {/if}
  </div>

  <div class="error-actions">
    <a href="/" class="error-button">Return Home</a>
    <button
      class="error-button error-button-secondary"
      onclick={() => window.history.back()}
    >
      Go Back
    </button>
  </div>
</div>

<style>
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-lg);
    padding: var(--space-xl);
    min-height: 50vh;
    text-align: center;
  }

  .error-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    border-radius: var(--radius-lg);
    background: var(--color-primary-50);
    color: var(--color-primary-600);
    opacity: 0.8;
  }

  .error-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    max-width: 48rem;
  }

  .error-code {
    margin: 0;
    font-size: var(--text-xl);
    color: var(--color-primary-600);
    font-weight: 700;
  }

  .error-title {
    margin: 0;
    font-size: var(--text-lg);
    color: var(--color-ink-950);
  }

  .error-message {
    margin: 0;
    font-size: var(--text-md);
    color: var(--color-ink-700);
    line-height: 1.6;
  }

  .error-details {
    margin-top: var(--space-sm);
    padding: var(--space-md);
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
    border: 1px solid var(--surface-color);
    font-size: var(--text-sm);
    color: var(--color-ink-600);
    font-family: 'JetBrains Mono', monospace;
    text-align: left;
    overflow-x: auto;
    word-break: break-word;
  }

  .error-actions {
    display: flex;
    gap: var(--space-md);
    flex-wrap: wrap;
    justify-content: center;
    margin-top: var(--space-md);
  }

  .error-button {
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-sm);
    border: none;
    font-size: var(--text-md);
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    transition: all var(--duration-fast) var(--ease-out-quart);
  }

  .error-button {
    background: var(--color-primary-600);
    color: white;
  }

  .error-button:hover {
    background: var(--color-primary-700);
    transform: translateY(-2px);
  }

  .error-button-secondary {
    background: var(--surface-raised);
    color: var(--color-ink-700);
    border: 1px solid var(--surface-color);
  }

  .error-button-secondary:hover {
    background: var(--surface-color);
  }

  @media (max-width: 640px) {
    .error-container {
      padding: var(--space-lg);
      min-height: 40vh;
    }

    .error-icon {
      width: 64px;
      height: 64px;
    }

    .error-actions {
      width: 100%;
    }

    .error-button {
      flex: 1;
    }
  }
</style>
