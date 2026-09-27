/**
 * reveal — scroll-triggered entrance animation.
 *
 * The `.animate-in` / `.content-reveal` utilities in motion.css fire once,
 * on mount, via a plain CSS animation. That's right for above-the-fold
 * content (the homepage hero, a page header) but wastes the motion on
 * anything below the fold: by the time a user scrolls to it, the animation
 * already finished before they could see it.
 *
 * This action defers the same visual treatment until the element actually
 * enters the viewport, using IntersectionObserver. It adds `.reveal` on
 * mount (the hidden starting state) and `.is-revealed` the first time the
 * element crosses the threshold, then stops observing — a one-shot
 * entrance, not a scroll-linked effect that replays.
 *
 * Usage: <section use:reveal> or <section use:reveal={{ delay: 100 }}>
 */
import type { Action } from "svelte/action";

interface RevealOptions {
  /** Extra delay in ms before the reveal animation starts, for manual stagger. */
  delay?: number;
}

export const reveal: Action<HTMLElement, RevealOptions | undefined> = (
  node,
  params,
) => {
  const delay = params?.delay ?? 0;

  // Respect reduced motion by skipping straight to the resting state —
  // no hidden-then-revealed flash, no motion at all.
  if (
    typeof window === "undefined" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return {};
  }

  // IntersectionObserver is universal in evergreen browsers; if it's ever
  // missing, fail open by leaving the element visible rather than stuck
  // hidden.
  if (typeof IntersectionObserver === "undefined") {
    return {};
  }

  // The element is server-rendered and already painted before this action
  // runs. If it's already on screen at hydration time, leave it alone —
  // hiding it now would flash content the user already saw, and the
  // IntersectionObserver's first callback isn't synchronous, so that flash
  // would be visible. The hide-then-reveal treatment is only for content
  // that's genuinely off-screen when JS takes over.
  const rect = node.getBoundingClientRect();
  const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
  if (alreadyVisible) {
    return {};
  }

  node.classList.add("reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (delay) {
          setTimeout(() => node.classList.add("is-revealed"), delay);
        } else {
          node.classList.add("is-revealed");
        }
        observer.unobserve(node);
      }
    },
    // Trigger a little before the element's bottom edge reaches the
    // viewport bottom, so the reveal reads as anticipatory, not laggy.
    { threshold: 0.1, rootMargin: "0px 0px -10% 0px" },
  );

  observer.observe(node);

  return {
    destroy() {
      observer.disconnect();
    },
  };
};
