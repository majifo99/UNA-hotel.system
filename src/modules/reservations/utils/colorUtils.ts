/**
 * Color utilities for reports charts
 */

/**
 * Convert a hex color (#RRGGBB or #RGB) to rgba string with given alpha
 */
export function hexToRgba(hex: string, alpha = 1): string {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  const raw = hex.replace('#', '').trim();
  let r = 0;
  let g = 0;
  let b = 0;

  if (raw.length === 3) {
    r = Number.parseInt(raw[0] + raw[0], 16);
    g = Number.parseInt(raw[1] + raw[1], 16);
    b = Number.parseInt(raw[2] + raw[2], 16);
  } else if (raw.length === 6) {
    r = Number.parseInt(raw.substring(0, 2), 16);
    g = Number.parseInt(raw.substring(2, 4), 16);
    b = Number.parseInt(raw.substring(4, 6), 16);
  } else {
    // fallback: try parse as integer triplet
    return `rgba(0,0,0,${alpha})`;
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Small palette to pick deterministic colors for chart slices when backend doesn't provide colors
 */
const DEFAULT_PALETTE = [
  '#1F77B4', // blue
  '#FF7F0E', // orange
  '#2CA02C', // green
  '#D62728', // red
  '#9467BD', // purple
  '#8C564B', // brown
  '#E377C2', // pink
  '#7F7F7F', // gray
  '#BCBD22', // olive
  '#17BECF', // cyan
];

/**
 * Get a color from the default palette by index or by hashing a key string
 */
export function getPaletteColor(indexOrKey: number | string): string {
  if (typeof indexOrKey === 'number') {
    return DEFAULT_PALETTE[indexOrKey % DEFAULT_PALETTE.length];
  }

  // simple hash of string to index
  let h = 0;
  for (let i = 0; i < indexOrKey.length; i++) {
    const cp = indexOrKey.codePointAt(i) ?? 0;
    h = Math.trunc(h * 31 + cp);
  }

  const idx = Math.abs(Math.trunc(h)) % DEFAULT_PALETTE.length;
  return DEFAULT_PALETTE[idx];
}
