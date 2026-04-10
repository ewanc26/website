/**
 * Dynamic OG image endpoint.
 * Generates OpenGraph images on demand using @ewanc26/og.
 *
 * Query params:
 * - title: Page title (required)
 * - description: Page description (optional)
 * - template: 'default' | 'blog' | 'profile' (default: 'default')
 */

import { createOgEndpoint } from '@ewanc26/og'
import { PUBLIC_SITE_URL } from '$env/static/public'

export const GET = createOgEndpoint({
	siteName: new URL(PUBLIC_SITE_URL).hostname,
	defaultTemplate: 'default',
	colors: {
		background: '#0f1a15',
		text: '#e8f5e9',
		accent: '#86efac',
	},
	noise: { enabled: true, opacity: 0.4 },
	cacheMaxAge: 86400, // 24 hours
})
