<script lang="ts">
  /**
   * AmbianceEngine — owns the Web Audio graph for the background soundscape
   * and wires it up to "what's happening on the site right now":
   *
   * - the Wheel of the Year (via the same Sabbat progress the theme uses)
   * - the time of day and the real Moon phase
   * - scroll and pointer activity, decayed back to stillness when the
   *   visitor stops moving
   * - "resting" — once nothing has happened for a while, the piece
   *   opens up (more reverb, slower chimes) rather than sitting static
   * - a one-shot "pulse" other components fire for real interactions
   *   (a comment published, a link copied)
   * - whether the current page is long-form reading (calmer texture)
   * - the "wolf mode" Easter egg
   * - tab visibility (suspended when hidden, to save battery)
   * - prefers-reduced-motion (calmer modulation, not silence)
   *
   * The AudioContext itself is only ever created inside a real user
   * gesture, to satisfy browser autoplay policy. Mounted once in the
   * root layout — its module-level-style state lives for the component's
   * lifetime, which spans the whole session since the root layout never
   * remounts across client-side navigation.
   */
  import { onMount } from "svelte";
  import { afterNavigate } from "$app/navigation";
  import { ambianceEnabled, onAmbiancePulse } from "$lib/stores/ambiance";
  import { wolfMode } from "$lib/stores/wolfMode";
  import { AmbianceEngine as Engine } from "$lib/music";

  const UPDATE_INTERVAL_MS = 5 * 60 * 1000;
  const VOLUME = 0.5;
  const READING_PATH = /^\/blog\/\d{4}\/\d{2}\/\d{2}\//;
  const RESTING_MS = 60 * 1000;

  let engine: Engine | null = null;

  onMount(() => {
    function ensureEngine(): Engine {
      if (!engine) {
        engine = new Engine();
        engine.update(new Date());
        engine.setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
        // Sync state that may have already changed before the engine existed.
        engine.setFocusMode(READING_PATH.test(location.pathname));
        engine.setWildMode(wolfMode.get());
      }
      return engine;
    }

    // Browsers refuse to start audio without a user gesture, so the very
    // first render never creates the AudioContext — only a click on the
    // toggle, or (for a returning visitor who already opted in) their
    // first interaction anywhere on the page, does.
    let hasGesture = false;

    const unsubscribeAmbiance = ambianceEnabled.subscribe((enabled) => {
      if (enabled && hasGesture) void ensureEngine().start(VOLUME);
      else engine?.stop();
    });

    const resumeIfEnabled = () => {
      hasGesture = true;
      if (ambianceEnabled.get()) void ensureEngine().start(VOLUME);
    };
    document.addEventListener("pointerdown", resumeIfEnabled, { once: true });
    document.addEventListener("keydown", resumeIfEnabled, { once: true });

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleReducedMotion = () => engine?.setReducedMotion(reducedMotionQuery.matches);
    reducedMotionQuery.addEventListener("change", handleReducedMotion);

    // Scroll and pointer movement both count as "activity", decaying
    // smoothly back to zero when the visitor stops doing either.
    let activity = 0;
    let lastScrollY = window.scrollY;
    let lastScrollTime = performance.now();
    let lastInteraction = performance.now();
    let resting = false;

    const markInteraction = () => {
      lastInteraction = performance.now();
      if (resting) {
        resting = false;
        engine?.setResting(false);
      }
    };

    const handleScroll = () => {
      const now = performance.now();
      const elapsed = Math.max(1, now - lastScrollTime);
      const delta = Math.abs(window.scrollY - lastScrollY);
      activity = Math.min(1, activity * 0.6 + (delta / elapsed) * 0.8);
      lastScrollY = window.scrollY;
      lastScrollTime = now;
      engine?.setActivity(activity);
      markInteraction();
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    let lastPointerX = 0;
    let lastPointerY = 0;
    let lastPointerTime = performance.now();
    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return; // touch scrolling is covered above
      const now = performance.now();
      const elapsed = Math.max(1, now - lastPointerTime);
      const distance = Math.hypot(event.clientX - lastPointerX, event.clientY - lastPointerY);
      activity = Math.min(1, activity * 0.6 + (distance / elapsed) * 0.5);
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      lastPointerTime = now;
      engine?.setActivity(activity);
      markInteraction();
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("keydown", markInteraction);

    const restingInterval = setInterval(() => {
      activity *= 0.85;
      engine?.setActivity(activity);
      if (!resting && performance.now() - lastInteraction > RESTING_MS) {
        resting = true;
        engine?.setResting(true);
      }
    }, 1000);

    const updateInterval = setInterval(() => engine?.update(new Date()), UPDATE_INTERVAL_MS);

    const handleVisibility = () => {
      if (!engine) return;
      if (document.visibilityState === "hidden") void engine.suspend();
      else if (ambianceEnabled.get()) void engine.resume();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // A one-shot confirmation chime for real interactions elsewhere on
    // the page (a comment published, a link copied) — see pulseAmbiance().
    const unsubscribePulse = onAmbiancePulse(() => engine?.pulse());

    const unsubscribeWolf = wolfMode.subscribe((on) => engine?.setWildMode(on));

    return () => {
      unsubscribeAmbiance();
      unsubscribePulse();
      unsubscribeWolf();
      document.removeEventListener("pointerdown", resumeIfEnabled);
      document.removeEventListener("keydown", resumeIfEnabled);
      document.removeEventListener("keydown", markInteraction);
      reducedMotionQuery.removeEventListener("change", handleReducedMotion);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(restingInterval);
      clearInterval(updateInterval);
    };
  });

  afterNavigate(() => {
    engine?.setFocusMode(READING_PATH.test(location.pathname));
  });
</script>
