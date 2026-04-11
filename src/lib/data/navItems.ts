import type { NavItem } from '@ewanc26/ui';

export type { NavItem };

export const navItems: NavItem[] = [
	{ href: '/', label: 'Home', iconPath: 'Home' },
	{ href: '/work', label: 'Work', iconPath: 'Briefcase' },
	{ href: '/site/meta', label: 'Site Meta', iconPath: 'Info' },
	{ href: '/github', label: 'GitHub', iconPath: 'Github' },
	{ href: '/archive', label: 'Archive', iconPath: 'Archive' }
];
