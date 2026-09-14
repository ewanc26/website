/**
 * Browser-facing landing page for /cv.
 *
 * Served as standalone HTML from the /cv server route when the client
 * sends Accept: text/html. Carries the site's design language — dark
 * surface, green accent, JetBrains Mono, prompt-style headers — and
 * shows the curl command that launches the interactive terminal CV.
 */

export function landingPage(origin: string): string {
  const canonical = origin.includes("localhost")
    ? "https://ewancroft.uk"
    : origin;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>CV — Ewan Croft</title>
<meta name="description" content="Interactive terminal CV for Ewan Croft. Served from AT Protocol records.">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>
  @font-face {
    font-family: "JetBrains Mono";
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url("/assets/fonts/JetBrainsMono-2.304/fonts/webfonts/JetBrainsMono-Regular.woff2") format("woff2");
  }
  :root {
    --bg: rgb(13 19 12);
    --surface: rgb(19 27 17);
    --border: rgb(40 54 34);
    --text: rgb(214 229 206);
    --text-dim: rgb(130 148 122);
    --accent: rgb(100 187 68);
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: "JetBrains Mono", ui-monospace, Menlo, monospace;
    font-size: 15px;
    line-height: 1.7;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
  main { max-width: 46rem; width: 100%; }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
  .panel {
    background: var(--surface);
    border: 1px solid var(--border);
  }
  .panel-head {
    padding: 10px 16px;
    border-bottom: 1px solid var(--border);
    color: var(--text-dim);
    font-size: 13px;
    text-transform: lowercase;
    letter-spacing: 0.02em;
  }
  .panel-body { padding: 24px; }
  h1 {
    font-size: 15px;
    font-weight: 400;
    color: var(--text);
    margin-bottom: 20px;
  }
  h1 .prompt { color: var(--accent); }
  .cmd {
    display: flex;
    align-items: baseline;
    gap: 10px;
    background: var(--bg);
    border: 1px solid var(--border);
    padding: 14px 16px;
    margin-bottom: 20px;
    overflow-x: auto;
    white-space: nowrap;
  }
  .cmd .prompt { color: var(--accent); flex-shrink: 0; }
  .cmd code { color: var(--text); }
  .cmd .cursor {
    display: inline-block;
    width: 8px;
    height: 17px;
    background: var(--accent);
    animation: blink 1s steps(1) infinite;
    flex-shrink: 0;
    align-self: center;
  }
  @keyframes blink { 50% { opacity: 0; } }
  p { color: var(--text-dim); margin-bottom: 12px; }
  p strong { color: var(--text); font-weight: 400; }
  .sections { margin: 20px 0; }
  .sections span { color: var(--accent); }
  .sections span::after { content: " · "; color: var(--text-dim); }
  .sections span:last-child::after { content: ""; }
  footer {
    margin-top: 16px;
    color: var(--text-dim);
    font-size: 13px;
  }
</style>
</head>
<body>
<main>
  <div class="panel">
    <div class="panel-head">ewan@ewancroft.uk:~</div>
    <div class="panel-body">
      <h1><span class="prompt">$</span> this cv lives in the terminal</h1>
      <div class="cmd">
        <span class="prompt">$</span>
        <code>curl -fsSL ${canonical}/cv | bash</code>
        <span class="cursor"></span>
      </div>
      <p>Interactive, menu-driven, no dependencies. Aggregated live from the same
      AT Protocol records as the <a href="/about">about page</a> — skills, education,
      languages, projects, links.</p>
      <p>Print a single section directly:</p>
      <div class="cmd"><span class="prompt">$</span><code>curl -fsSL ${canonical}/cv | bash -s -- skills</code></div>
      <div class="sections">
        <span>summary</span><span>methodology</span><span>skills</span><span>projects</span><span>experience</span><span>education</span><span>languages</span><span>links</span>
      </div>
      <p>Piping without a tty dumps the full CV as plain text.</p>
    </div>
  </div>
  <footer>ewan@ewancroft.uk:~$ <a href="/">cd ~</a> · <a href="/about">cat about</a> · <a href="https://github.com/ewanc26">github</a></footer>
</main>
</body>
</html>`;
}
