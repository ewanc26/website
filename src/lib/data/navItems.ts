export interface NavItem {
	href: string;
	label: string;
    // The property holds the Lucide component name (e.g., 'Home')
	iconPath: string;
}

export const navItems: NavItem[] = [
    // FIX: Use the component export name directly
  { href: '/', label: 'Home', iconPath: 'Home' },
  { href: 'https://blog.ewancroft.uk', label: 'Blog', iconPath: 'Book' },
  { href: '/site/meta', label: 'Site Meta', iconPath: 'Info' }
];