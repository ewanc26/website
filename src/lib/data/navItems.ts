import type { NavItem } from '@ewanc26/ui';

export type { NavItem };

export const navItems: NavItem[] = [
	{ href: '/', label: 'Home', iconPath: 'Home' },
	{ href: '/site/meta', label: 'Site Meta', iconPath: 'Info' },
	{ href: '/archive', label: 'Archive', iconPath: 'Archive' }
];
