/**
 * Lets something below the fold settle into place the first time it is
 * scrolled to. Anything already on screen, and everything without JavaScript
 * or with reduced motion, is simply there.
 */
export function reveal(node: HTMLElement) {
  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    node.getBoundingClientRect().top < window.innerHeight
  ) {
    return;
  }

  node.classList.add("reveal-pending");
  const observer = new IntersectionObserver((entries) => {
    // Passed already counts too, so a jump down the page leaves nothing hidden.
    if (!entries.some((e) => e.isIntersecting || e.boundingClientRect.top < 0)) return;
    node.classList.replace("reveal-pending", "reveal-in");
    observer.disconnect();
  });
  observer.observe(node);

  return () => observer.disconnect();
}
