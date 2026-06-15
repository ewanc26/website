/**
 * Generates a deterministic 8x8 blocky SVG avatar based on a seed (DID).
 */
export function getPlaceholderAvatar(seed: string): string {
  // Simple deterministic hash function
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate color
  const hue = Math.abs(hash) % 360;
  const color = `hsl(${hue}, 60%, 50%)`;

  // Generate a deterministic 8x8 grid of blocks (only need 4x8 for symmetry)
  const grid = [];
  for (let i = 0; i < 32; i++) {
    // Use bits from hash to decide if block is active
    grid.push((hash >> (i % 31)) & 1);
  }

  // Generate SVG blocks
  const blocks = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      // Create symmetry: 8x8 grid mirroring 4x8
      const active = j < 4 ? grid[i * 4 + j] : grid[i * 4 + (7 - j)];
      if (active) {
        blocks.push(
          `<rect x="${j * 16}" y="${i * 16}" width="16" height="16" fill="${color}" />`,
        );
      }
    }
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <rect width="128" height="128" fill="#f0f0f0" />
      ${blocks.join("")}
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
