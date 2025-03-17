<script lang="ts">
	import '../app.css';
	/* cSpell:ignore Ewan Ewan's Optimisation */
	// Destructure the children render function from $props
	let { children } = $props();
	import Footer from '$lib/components/Footer.svelte';
  </script>
  
  <svelte:head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
  
	<!-- Meta Tags for SEO and Personal Branding -->
	<meta
	  name="description"
	  content="Welcome to Ewan's Web Corner - A personal blog where I share my thoughts on coding, technology, and life."
	/>
	<meta
	  name="keywords"
	  content="Ewan, personal blog, coding, technology, programming, tech blog, Ewan's Web Corner"
	/>
	<meta name="author" content="Ewan Croft" />
	<meta name="robots" content="index, follow" />
  
	<!-- Open Graph Meta Tags for Social Media -->
	<meta property="og:title" content="Ewan's Web Corner" />
	<meta
	  property="og:description"
	  content="Explore my personal website where I share my ramblings."
	/>
	<meta property="og:image" content="/images/embed-preview.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:url" content="https://ewancroft.uk" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Ewan's Web Corner" />
  
	<!-- Favicon and Icons (Static Fallbacks) -->
	<link
	  id="icon-32"
	  rel="icon"
	  type="image/png"
	  sizes="32x32"
	  href="/images/favicon/favicon-32x32.png"
	/>
	<link
	  id="icon-16"
	  rel="icon"
	  type="image/png"
	  sizes="16x16"
	  href="/images/favicon/favicon-16x16.png"
	/>
	<link
	  id="apple-touch-icon"
	  rel="apple-touch-icon"
	  sizes="180x180"
	  href="/images/favicon/apple-touch-icon.png"
	/>
	<link
	  id="android-chrome-192x192"
	  rel="icon"
	  type="image/png"
	  sizes="192x192"
	  href="/images/favicon/android-chrome-192x192.png"
	/>
	<link
	  id="android-chrome-512x512"
	  rel="icon"
	  type="image/png"
	  sizes="512x512"
	  href="/images/favicon/android-chrome-512x512.png"
	/>
	<link rel="manifest" href="/images/favicon/site.webmanifest" />
  
	<!-- Mobile Optimisation -->
	<meta name="mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
  
	<!-- Other Meta Tags for Compatibility -->
	<meta name="format-detection" content="telephone=no" />
	<meta name="msapplication-TileColor" content="#0a1607" />
	<meta name="msapplication-TileImage" content="/images/favicon/ms-icon-144x144.png" />
  </svelte:head>
  
  <div class="layout">
	{@render children()}
	<Footer />
  </div>
  
  <style>
	.layout {
	  display: flex;
	  flex-direction: column;
	  min-height: 100vh;
	}
  </style>
  