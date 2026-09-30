<script lang="ts">
  // Easter eggs — Anglo-Scottish and werewolf. Type a word anywhere outside a field:
  //   saltire / george / union   flag veils (also automatic on 30 Nov and 23 Apr, once per session)
  //   tartan                     plaid overprint
  //   howl                       moonrise
  //   werewolf                   the change: claw marks and a red vignette
  // Nights of a real full moon also tint the nav triskele.
  import { onMount } from "svelte";
  import { afterNavigate } from "$app/navigation";
  import { getMoonPhase } from "$lib/utils/moonPhase";

  const FLAGS: Record<string, { svg: string; label: string }> = {
    saltire: {
      label: "SAINT ANDREW · THE SALTIRE",
      svg: `<svg viewBox="0 0 5 3" preserveAspectRatio="xMidYMid slice"><rect width="5" height="3" fill="#005EB8"/><path d="M0 0L5 3M5 0L0 3" stroke="#fff" stroke-width=".6"/></svg>`,
    },
    george: {
      label: "SAINT GEORGE · THE CROSS",
      svg: `<svg viewBox="0 0 5 3" preserveAspectRatio="xMidYMid slice"><rect width="5" height="3" fill="#fff"/><path d="M2.5 0V3M0 1.5H5" stroke="#CE1124" stroke-width=".6"/></svg>`,
    },
    union: {
      label: "TWO CROWNS · ONE ISLAND",
      svg: `<svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice"><rect width="60" height="30" fill="#012169"/><path d="M0 0L60 30M60 0L0 30" stroke="#fff" stroke-width="6"/><path d="M0 0L60 30M60 0L0 30" stroke="#C8102E" stroke-width="2"/><path d="M30 0V30M0 15H60" stroke="#fff" stroke-width="10"/><path d="M30 0V30M0 15H60" stroke="#C8102E" stroke-width="6"/></svg>`,
    },
  };

  let flagEl: HTMLDivElement | undefined = $state();
  let toastEl: HTMLDivElement | undefined = $state();
  let moonriseEl: HTMLDivElement | undefined = $state();
  let clawsEl: HTMLDivElement | undefined = $state();

  let flagHidden = $state(true);
  let toastHidden = $state(true);
  let moonriseHidden = $state(true);
  let clawsHidden = $state(true);
  let flagSvg = $state("");
  let clawsSvg = $state("");
  let toastText = $state("");

  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  function show(key: string, setHidden: (v: boolean) => void, ms: number, after?: () => void) {
      clearTimeout(timers.get(key));
      setHidden(true);
      requestAnimationFrame(() => setHidden(false));
      timers.set(
        key,
        setTimeout(() => {
          setHidden(true);
          after?.();
        }, ms),
      );
    }

  function toast(text: string, ms = 3600) {
    toastText = text;
    show("toast", (v) => (toastHidden = v), ms);
  }

  function flag(name: keyof typeof FLAGS) {
    flagSvg = FLAGS[name].svg;
    show("flag", (v) => (flagHidden = v), 3400);
    toast(FLAGS[name].label, 3400);
  }

  const rnd = (a: number, b: number) => a + Math.random() * (b - a);

  // Four uneven gouges: ragged, tapered wedges, wide where the claw bites and thin where it lifts.
  function drawClaws() {
    const tilt = rnd(16, 30);
    const base = rnd(14, 30);
    let body = "";
    for (let i = 0; i < 4; i++) {
      const x0 = base + i * rnd(11, 15);
      const y0 = -8 + rnd(-3, 3) + i * 1.2;
      const x1 = x0 + tilt + rnd(-3, 3);
      const y1 = 108 + rnd(-4, 4);
      const cx = (x0 + x1) / 2 + rnd(-7, 7);
      const cy = (y0 + y1) / 2;
      const lead = rnd(3.4, 4.8) * (i === 0 || i === 3 ? 0.75 : 1);
      const left: string[] = [];
      const right: string[] = [];
      const N = 28;
      for (let k = 0; k <= N; k++) {
        const t = k / N;
        const u = 1 - t;
        const x = u * u * x0 + 2 * u * t * cx + t * t * x1;
        const y = u * u * y0 + 2 * u * t * cy + t * t * y1;
        const dx = 2 * u * (cx - x0) + 2 * t * (x1 - cx);
        const dy = 2 * u * (cy - y0) + 2 * t * (y1 - cy);
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const w = lead * Math.pow(Math.sin(Math.PI * Math.min(1, t * 0.5 + 0.12)), 0.8) * Math.pow(1 - t, 0.9);
        const a = w * rnd(0.55, 1.15);
        const b = w * rnd(0.55, 1.15);
        left.push(`${(x + nx * a).toFixed(2)},${(y + ny * a).toFixed(2)}`);
        right.push(`${(x - nx * b).toFixed(2)},${(y - ny * b).toFixed(2)}`);
      }
      const d = `M${left.join("L")}L${right.reverse().join("L")}Z`;
      body += `<g><path class="flesh" d="${d}"/><path class="wound" d="${d}"/></g>`;
      for (let k = 0; k < 3; k++) {
        const t = rnd(0.15, 0.8);
        body += `<circle class="spatter" style="animation-delay:${i * 90 + 260}ms" cx="${(x0 + (x1 - x0) * t + rnd(-4, 4)).toFixed(1)}" cy="${(y0 + (y1 - y0) * t + rnd(-2, 2)).toFixed(1)}" r="${rnd(0.15, 0.55).toFixed(2)}"/>`;
      }
    }
    clawsSvg = `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">${body}</svg>`;
  }

  const effects: Record<string, () => void> = {
    saltire: () => flag("saltire"),
    george: () => flag("george"),
    union: () => flag("union"),
    tartan: () => {
      document.body.classList.add("tartan-on");
      toast("TARTAN", 4600);
      setTimeout(() => document.body.classList.remove("tartan-on"), 4600);
    },
    howl: () => {
      show("moonrise", (v) => (moonriseHidden = v), 4600);
      toast("AWOOOOO", 3200);
    },
    werewolf: () => {
      document.body.classList.add("turning");
      drawClaws();
      show("claws", (v) => (clawsHidden = v), 3000);
      toast("THE MOON IS UP.", 2800);
      setTimeout(() => document.body.classList.remove("turning"), 2600);
    },
  };

  let buffer = "";
  function handleKeydown(e: KeyboardEvent) {
    const t = e.target;
    if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
    if (t instanceof HTMLElement && (t.isContentEditable || t.matches("input, textarea, select"))) return;
    buffer = `${buffer}${e.key.toLowerCase()}`.slice(-12);
    for (const word of Object.keys(effects)) {
      if (buffer.endsWith(word)) {
        buffer = "";
        effects[word]();
        return;
      }
    }
  }

  function onNavigate() {
    try {
      const p = getMoonPhase(new Date()).phase;
      document.body.classList.toggle("is-full-moon", Math.abs(p - 0.5) < 0.03);
    } catch {
      /* moon is decoration */
    }

    const d = new Date();
    const day = `${d.getMonth() + 1}-${d.getDate()}`;
    const key = day === "11-30" ? "saltire" : day === "4-23" ? "george" : null;
    if (!key) return;
    try {
      if (sessionStorage.getItem("flag-day")) return;
      sessionStorage.setItem("flag-day", "1");
    } catch {
      return;
    }
    setTimeout(() => flag(key as keyof typeof FLAGS), 900);
  }

  onMount(() => {
    document.addEventListener("keydown", handleKeydown);
    // afterNavigate below also fires once on initial mount, covering the
    // first-load case, so no separate onNavigate() call is needed here.
    return () => {
      document.removeEventListener("keydown", handleKeydown);
      for (const t of timers.values()) clearTimeout(t);
    };
  });

  afterNavigate(onNavigate);
</script>

<div class="flag-veil" bind:this={flagEl} hidden={flagHidden} aria-hidden="true">{@html flagSvg}</div>
<div class="heritage-toast" bind:this={toastEl} role="status" aria-live="polite" hidden={toastHidden}>{toastText}</div>
<div class="moonrise" bind:this={moonriseEl} hidden={moonriseHidden} aria-hidden="true"></div>
<div class="claws" bind:this={clawsEl} hidden={clawsHidden} aria-hidden="true">{@html clawsSvg}</div>
<div class="vignette" aria-hidden="true"></div>
<div class="plaid" aria-hidden="true"></div>

<style>
  [hidden] {
    display: none !important;
  }

  .flag-veil {
    position: fixed;
    inset: 0;
    z-index: 9998;
    pointer-events: none;
    opacity: 0;
    animation: veil 3.4s ease-in-out both;
  }
  .flag-veil :global(svg) {
    width: 100%;
    height: 100%;
    display: block;
  }
  @keyframes veil {
    0% {
      opacity: 0;
      clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
    }
    18% {
      opacity: 0.92;
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    }
    72% {
      opacity: 0.92;
    }
    100% {
      opacity: 0;
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    }
  }

  .vignette,
  .plaid {
    display: none;
  }

  .heritage-toast {
    position: fixed;
    left: 50%;
    bottom: 5.5rem;
    z-index: 9999;
    translate: -50% 0;
    padding: 0.6rem 1rem;
    border: 1px solid var(--ink);
    background: var(--paper);
    color: var(--ink);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    pointer-events: none;
    animation: toast-in 300ms ease-out both;
  }
  @keyframes toast-in {
    from {
      opacity: 0;
      transform: translateY(0.6rem);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  .moonrise {
    position: fixed;
    left: 50%;
    bottom: 0;
    z-index: 9997;
    width: min(46vw, 26rem);
    aspect-ratio: 1;
    translate: -50% 0;
    border-radius: 50%;
    pointer-events: none;
    background: radial-gradient(circle at 38% 36%, oklch(97% 0.02 95), oklch(86% 0.03 90) 60%, oklch(74% 0.03 85));
    box-shadow: 0 0 6rem 2rem oklch(90% 0.05 95 / 0.55);
    animation: rise 4.6s ease-in-out both;
  }
  @keyframes rise {
    0% {
      transform: translateY(100%);
      opacity: 0;
    }
    30%,
    75% {
      transform: translateY(20%);
      opacity: 1;
    }
    100% {
      transform: translateY(-40%);
      opacity: 0;
    }
  }

  .claws {
    position: fixed;
    inset: 0;
    z-index: 9998;
    pointer-events: none;
    animation:
      claws-wipe 0.45s cubic-bezier(0.3, 0.9, 0.2, 1) both,
      claws-fade 0.9s ease-in 2.1s forwards;
  }
  .claws :global(svg) {
    width: 100%;
    height: 100%;
    display: block;
    will-change: transform;
  }
  .claws :global(.wound) {
    fill: oklch(31% 0.15 27);
  }
  .claws :global(.flesh) {
    fill: oklch(72% 0.12 25);
    stroke: oklch(72% 0.12 25);
    stroke-width: 0.7;
    stroke-linejoin: round;
  }
  .claws :global(.spatter) {
    fill: oklch(35% 0.16 27);
    opacity: 0;
    animation: spatter 0.2s ease-out forwards;
  }
  @keyframes claws-wipe {
    from {
      clip-path: inset(0 0 100% 0);
    }
    to {
      clip-path: inset(0);
    }
  }
  @keyframes spatter {
    to {
      opacity: 0.9;
    }
  }
  @keyframes claws-fade {
    to {
      opacity: 0;
    }
  }

  :global(body.turning) .vignette {
    display: block;
    will-change: opacity;
    position: fixed;
    inset: 0;
    z-index: 9996;
    pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 40%, oklch(30% 0.16 27 / 0.75));
    animation: vignette 2.6s ease-in-out both;
  }
  :global(body.turning .shell-main) {
    animation: change 2.6s steps(1, end) both;
    will-change: transform;
  }
  @keyframes vignette {
    0%,
    100% {
      opacity: 0;
    }
    20%,
    70% {
      opacity: 1;
    }
  }
  @keyframes change {
    0%,
    100% {
      transform: none;
    }
    15% {
      transform: translate(3px, -1px);
    }
    30% {
      transform: translate(-3px, 1px);
    }
    45% {
      transform: translate(2px, 2px);
    }
    60% {
      transform: translate(-2px, -1px);
    }
    75% {
      transform: none;
    }
  }

  :global(body.tartan-on) .plaid {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 9996;
    pointer-events: none;
    mix-blend-mode: multiply;
    background:
      repeating-linear-gradient(90deg, oklch(40% 0.14 145 / 0.55) 0 28px, transparent 28px 44px, oklch(35% 0.12 260 / 0.55) 44px 52px, transparent 52px 96px),
      repeating-linear-gradient(0deg, oklch(45% 0.2 27 / 0.55) 0 28px, transparent 28px 44px, oklch(35% 0.12 260 / 0.55) 44px 52px, transparent 52px 96px);
    animation: tartan 4.6s ease-in-out both;
  }
  @keyframes tartan {
    0%,
    100% {
      opacity: 0;
    }
    15%,
    80% {
      opacity: 1;
    }
  }

  :global(body.is-full-moon .nav-brand) {
    color: oklch(88% 0.06 90);
    filter: drop-shadow(0 0 6px oklch(90% 0.08 90 / 0.6));
  }

  @media (prefers-reduced-motion: reduce) {
    .flag-veil,
    .moonrise,
    .heritage-toast,
    .claws,
    .claws :global(.spatter),
    :global(body.turning .shell-main),
    :global(body.turning) .vignette,
    :global(body.tartan-on) .plaid {
      animation: none;
    }
    .flag-veil {
      opacity: 0.85;
    }
    .moonrise {
      opacity: 1;
      transform: translateY(20%);
    }
  }
</style>
