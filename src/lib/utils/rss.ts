/**
 * RSS Feed Generation Utilities
 */

export interface RSSChannelConfig {
	title: string;
	link: string;
	description: string;
	language?: string;
	selfLink?: string;
	copyright?: string;
	managingEditor?: string;
	webMaster?: string;
	generator?: string;
	ttl?: number;
}

export interface RSSItem {
	title: string;
	link: string;
	guid?: string;
	pubDate: Date | string;
	description?: string;
	content?: string;
	author?: string;
	categories?: string[];
	enclosure?: {
		url: string;
		length?: number;
		type?: string;
	};
	comments?: string;
	source?: {
		url: string;
		title: string;
	};
}

/**
 * Escape XML special characters (minimal escaping for UTF-8 RSS feeds)
 * Only escapes characters that MUST be escaped in XML
 */
export function escapeXml(unsafe: string): string {
	return unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

/**
 * Escape XML attributes (includes quotes)
 */
export function escapeXmlAttribute(unsafe: string): string {
	return unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/**
 * Normalize special characters to their UTF-8 equivalents
 */
export function normalizeCharacters(text: string): string {
	return text
		// Smart quotes
		.replace(/\u2018|\u2019|\u201A|\u201B/g, "'")
		.replace(/\u201C|\u201D|\u201E|\u201F/g, '"')
		// Em and en dashes
		.replace(/\u2013/g, '-')
		.replace(/\u2014/g, '--')
		// Other special spaces and characters
		.replace(/\u00A0/g, ' ') // non-breaking space
		.replace(/\u2026/g, '...') // ellipsis
		.replace(/\u2022/g, '*') // bullet
		// HTML entities that might have been left in
		.replace(/&apos;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&nbsp;/g, ' ')
		.replace(/&mdash;/g, '--')
		.replace(/&ndash;/g, '-')
		.replace(/&hellip;/g, '...')
		.replace(/&rsquo;/g, "'")
		.replace(/&lsquo;/g, "'")
		.replace(/&rdquo;/g, '"')
		.replace(/&ldquo;/g, '"');
}

/**
 * Format a date for RSS (RFC 822 format)
 */
export function formatRSSDate(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toUTCString();
}

/**
 * Generate an RSS item XML string
 */
export function generateRSSItem(item: RSSItem): string {
	const guid = item.guid || item.link;
	const pubDate = formatRSSDate(item.pubDate);
	
	// Normalize and escape text content
	const title = escapeXml(normalizeCharacters(item.title));
	const description = item.description ? escapeXml(normalizeCharacters(item.description)) : '';
	const content = item.content ? normalizeCharacters(item.content) : '';
	const author = item.author ? escapeXml(normalizeCharacters(item.author)) : '';
	
	const categories =
		item.categories?.map((cat) => `      <category>${escapeXml(normalizeCharacters(cat))}</category>`).join('\n') || '';

	let enclosure = '';
	if (item.enclosure) {
		const length = item.enclosure.length ? ` length="${item.enclosure.length}"` : '';
		const type = item.enclosure.type ? ` type="${escapeXmlAttribute(item.enclosure.type)}"` : '';
		enclosure = `      <enclosure url="${escapeXmlAttribute(item.enclosure.url)}"${length}${type} />`;
	}

	let source = '';
	if (item.source) {
		source = `      <source url="${escapeXmlAttribute(item.source.url)}">${escapeXml(normalizeCharacters(item.source.title))}</source>`;
	}

	return `    <item>
      <title>${title}</title>
      <link>${escapeXmlAttribute(item.link)}</link>
      <guid isPermaLink="true">${escapeXmlAttribute(guid)}</guid>
      <pubDate>${pubDate}</pubDate>${description ? `\n      <description>${description}</description>` : ''}${content ? `\n      <content:encoded><![CDATA[${content}]]></content:encoded>` : ''}${author ? `\n      <author>${author}</author>` : ''}${item.comments ? `\n      <comments>${escapeXmlAttribute(item.comments)}</comments>` : ''}${categories ? `\n${categories}` : ''}${enclosure ? `\n${enclosure}` : ''}${source ? `\n${source}` : ''}
    </item>`;
}

/**
 * Generate a complete RSS 2.0 feed
 */
export function generateRSSFeed(config: RSSChannelConfig, items: RSSItem[]): string {
	const language = config.language || 'en';
	const generator = config.generator || 'SvelteKit with AT Protocol';
	const lastBuildDate = formatRSSDate(new Date());
	
	// Normalize and escape channel data
	const title = escapeXml(normalizeCharacters(config.title));
	const link = escapeXmlAttribute(config.link);
	const description = escapeXml(normalizeCharacters(config.description));
	const generatorText = escapeXml(normalizeCharacters(generator));

	const atomLink = config.selfLink
		? `    <atom:link href="${escapeXmlAttribute(config.selfLink)}" rel="self" type="application/rss+xml" />`
		: '';

	const optionalFields = [];
	if (config.copyright) {
		optionalFields.push(`    <copyright>${escapeXml(normalizeCharacters(config.copyright))}</copyright>`);
	}
	if (config.managingEditor) {
		optionalFields.push(`    <managingEditor>${escapeXml(normalizeCharacters(config.managingEditor))}</managingEditor>`);
	}
	if (config.webMaster) {
		optionalFields.push(`    <webMaster>${escapeXml(normalizeCharacters(config.webMaster))}</webMaster>`);
	}
	if (config.ttl) {
		optionalFields.push(`    <ttl>${config.ttl}</ttl>`);
	}

	const itemsXml = items.map((item) => generateRSSItem(item)).join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${title}</title>
    <link>${link}</link>
    <description>${description}</description>
    <language>${language}</language>${atomLink ? `\n${atomLink}` : ''}
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>${generatorText}</generator>${optionalFields.length > 0 ? `\n${optionalFields.join('\n')}` : ''}
${itemsXml}
  </channel>
</rss>`;
}

/**
 * Create an RSS Response object ready to be returned from a SvelteKit endpoint
 */
export function createRSSResponse(
	feed: string,
	options?: {
		cacheMaxAge?: number;
		status?: number;
	}
): Response {
	const cacheMaxAge = options?.cacheMaxAge ?? 3600;
	const status = options?.status ?? 200;

	return new Response(feed, {
		status,
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': `public, max-age=${cacheMaxAge}`
		}
	});
}
