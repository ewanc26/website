export async function getSupporters() {
	// Ko-fi API doesn't have a public endpoint for a list,
	// so we'll maintain a simple list here for now.
	return [{ name: 'Ewan Croft', tier: 'Benefactor' }];
}
