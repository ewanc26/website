/**
 * OG (Open Graph) image URL generation.
 * Dynamic images are generated via /api/og endpoint.
 */

/**
 * Generate a dynamic OG image URL.
 *
 * @example
 * ```ts
 * ogUrl({ title: 'My Post', description: 'A great post' })
 * // Returns: "/api/og?title=My+Post&description=A+great+post&template=default"
 * ```
 */
export interface OgUrlOptions {
	title: string
	description?: string
	template?: 'default' | 'blog' | 'profile'
}

export function ogUrl(options: OgUrlOptions): string {
	const params = new URLSearchParams()
	params.set('title', options.title)
	if (options.description) params.set('description', options.description)
	if (options.template && options.template !== 'default') params.set('template', options.template)
	return `/api/og?${params.toString()}`
}
