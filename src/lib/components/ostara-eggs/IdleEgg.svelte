<script lang="ts">
  // Easter egg #8 — after 5 uninterrupted minutes, Selene checks in. Dismisses after 10 s, then re-arms.
  import { onMount } from "svelte";

  const IDLE_MS = 5 * 60 * 1000;
  const TOAST_MS = 10_000;

  let toastEl: HTMLDivElement | undefined = $state();
  let hidden = $state(true);

  onMount(() => {
    let visible = false;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let hideTimer: ReturnType<typeof setTimeout> | null = null;

    function arm() {
      if (idleTimer) clearTimeout(idleTimer);
      if (visible) return;
      idleTimer = setTimeout(show, IDLE_MS);
    }

    function show() {
      visible = true;
      hidden = true;
      requestAnimationFrame(() => (hidden = false));
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        visible = false;
        hidden = true;
        arm();
      }, TOAST_MS);
    }

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "wheel"] as const;
    for (const ev of events) document.addEventListener(ev, arm, { passive: true });
    arm();

    return () => {
      for (const ev of events) document.removeEventListener(ev, arm);
      if (idleTimer) clearTimeout(idleTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  });
</script>

<div class="idle-toast" role="status" aria-live="polite" bind:this={toastEl} {hidden}>Still here? Good. So is she.</div>

<style>
  .idle-toast {
    position: fixed;
    bottom: var(--space-lg);
    right: var(--space-lg);
    max-width: 14rem;
    background: var(--surface-raised);
    border: 1px solid var(--color-text-200);
    color: var(--color-text-700);
    font-size: var(--text-sm, 0.875rem);
    line-height: 1.5;
    padding: var(--space-3) var(--space-md);
    border-radius: var(--radius-md);
    z-index: 9999;
    pointer-events: none;
    animation:
      ie-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
      ie-out 0.4s ease-in forwards 9.6s;
  }

  @keyframes ie-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes ie-out {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(4px);
    }
  }
</style>
