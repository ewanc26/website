export interface NavItem {
	href: string;
	label: string;
    // The property holds the Lucide component name (e.g., 'Home')
	iconPath: string;
}

export const navItems: NavItem[] = [
  { href: '/', label: 'Home', iconPath: 'Home' },
  { href: '/site/meta', label: 'Site Meta', iconPath: 'Info' }
];