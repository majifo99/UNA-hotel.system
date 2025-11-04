/**
 * Color Utilities
 * 
 * Helper functions for color manipulation and conversion
 */

/**
 * Converts HEX color to RGBA format
 * @param hex - HEX color (e.g., '#FF0000')
 * @param alpha - Opacity (0-1)
 * @returns RGBA string (e.g., 'rgba(255, 0, 0, 0.5)')
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Gets color from predefined palette
 * @param index - Palette index
 * @returns HEX color string
 */
export function getPaletteColor(index: number): string {
  const palette = [
    '#4F46E5', // Indigo
    '#06B6D4', // Cyan
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
  ];
  
  return palette[index % palette.length];
}

/**
 * Lightens a HEX color by a percentage
 * @param hex - HEX color
 * @param percent - Lighten percentage (0-100)
 * @returns Lightened HEX color
 */
export function lightenColor(hex: string, percent: number): string {
  const cleanHex = hex.replace('#', '');
  
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  const lighten = (value: number) => {
    const lightened = Math.round(value + (255 - value) * (percent / 100));
    return Math.min(255, lightened);
  };
  
  const newR = lighten(r).toString(16).padStart(2, '0');
  const newG = lighten(g).toString(16).padStart(2, '0');
  const newB = lighten(b).toString(16).padStart(2, '0');
  
  return `#${newR}${newG}${newB}`;
}
