<script lang="ts">
  import { page } from "$app/stores";
</script>

<svelte:head>
  <title>About This Website - Ewan's Corner</title>
  <meta
    name="description"
    content="Information about Ewan's Corner including privacy policy, technology stack, and website purpose."
  />
  <meta
    name="keywords"
    content="about, information, privacy policy, technology stack, Ewan's Corner"
  />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={$page.url.origin + $page.url.pathname} />
  <meta property="og:title" content="About This Website - Ewan's Corner" />
  <meta
    property="og:description"
    content="Learn about Ewan's Corner - including technology stack, website purpose, and privacy information."
  />
  <meta property="og:site_name" content="Ewan's Corner" />
  <meta property="og:image" content={$page.url.origin + "/embed/main.png"} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content={$page.url.origin + $page.url.pathname} />
  <meta name="twitter:title" content="About This Website - Ewan's Corner" />
  <meta
    name="twitter:description"
    content="Learn about Ewan's Corner - including technology stack, website purpose, and privacy information."
  />
  <meta name="twitter:image" content={$page.url.origin + "/embed/main.png"} />
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-6">About This Website</h1>

  <div class="prose dark:prose-invert">
    <h2 class="text-xl font-semibold mt-6 mb-2">Website Purpose</h2>
    <p>
      This is my personal website where I share thoughts, projects, and
      occasional blog posts. It serves as a creative outlet and link aggregate.
    </p>

    <h2 class="text-xl font-semibold mt-6 mb-2">Technology Stack</h2>
    <p>This website is built with:</p>
    <ul>
      <li>
        <a
          href="https://svelte.dev/docs/kit/introduction"
          class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
          >SvelteKit</a
        > for the frontend framework
      </li>
      <li>
        <a
          href="https://tailwindcss.com/"
          class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
          >Tailwind CSS</a
        > for styling
      </li>
      <li>
        <a
          href="https://vite.dev/"
          class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
          >Vite</a
        > as the build tool
      </li>
      <li>
        <a
          href="https://www.markdownguide.org/"
          class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
          >Markdown</a
        > for content authoring
      </li>
      <li>
        <a
          href="https://atproto.com/"
          class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
          >AT Protocol</a
        > for decentralized identity and data handling
      </li>
    </ul>

    <h2 class="text-xl font-semibold mt-6 mb-2">Privacy Notice</h2>
    <p>
      Please note the following important information regarding your privacy
      while on the website:
    </p>
    <h2 class="text-xl font-semibold mt-6 mb-2">No Cookies</h2>
    <p>
      As a static website, there are no cookies used on this site. Cookies are
      small data files placed on your device by websites you visit, but since my
      site is static and does not involve database storage, cookies are not
      employed.
    </p>

    <h2 class="text-xl font-semibold mt-6 mb-2">Open Source</h2>
    <p>
      This website is a customised fork of <a
        href="https://github.com/hugeblank/whitebreeze"
        class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
        >WhiteBreeze</a
      >, a frontend for the AT Protocol powered
      <a
        href="https://whtwnd.com/"
        class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
        >WhiteWind</a
      >
      markdown blog service. The source code is available on
      <a
        href="https://github.com/ewanc26/website"
        class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
        >GitHub</a
      >
      and mirrored on
      <a
        href="https://tangled.sh/did:plc:ofrbh253gwicbkc5nktqepol/website"
        class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
        >Tangled</a
      >. There is no hidden tracking or data collection.
    </p>

    <p class="mt-6">
      This website is intended for personal use to blog and share content. I do
      not intend to collect or mine any data from you. If you'd like to read the
      licensing details, please see the links in the footer.
    </p>

    <h2 class="text-xl font-semibold mt-6 mb-2">Font Credits</h2>
    <p>
      This website uses the <a
        href="https://recursive.design/"
        class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
        >Recursive</a
      > font by ArrowType, available under the
      <a
        href="/fonts/ArrowType-Recursive-1.085/LICENSE.txt"
        class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
        >SIL Open Font License</a
      >.
    </p>

    <p class="mt-6">Thank you for visiting!</p>
  </div>
</div>
