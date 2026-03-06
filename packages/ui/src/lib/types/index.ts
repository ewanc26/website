export interface SiteMetadata {
	title: string;
	description: string;
	keywords: string;
	url: string;
	image: string;
	imageWidth?: number;
	imageHeight?: number;
}

/**
 * A nav item used by Header and NavLinks.
 * The `iconPath` is a Lucide icon component name (e.g. 'Home', 'Archive').
 */
export interface NavItem {
	href: string;
	label: string;
	iconPath: string;
}
