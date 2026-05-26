import type { NavItem } from '@ewanc26/ui';

export type { NavItem };

export const navItems: NavItem[] = [
	{ href: '/', label: 'Home', iconPath: 'Home' },
	{ href: '/work', label: 'Work', iconPath: 'Briefcase' },
	{ href: '/support', label: 'Support', iconPath: 'Heart' },
	{ href: '/site/meta', label: 'Site Meta', iconPath: 'Info' },
	{ href: '/archive', label: 'Archive', iconPath: 'Archive' }
];
