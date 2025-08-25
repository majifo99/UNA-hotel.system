/**
 * UNA Hotel System - Design System Colors
 * 
 * Elegant color palette inspired by nature and luxury hospitality.
 * Colors are organized by usage and provide a cohesive visual identity.
 */

/**
 * Primary Color Palette
 * Main brand colors used throughout the application
 */
export const colors = {
  // Primary greens - Brand identity
  primary: {
    900: '#1A3636', // Darkest green - Headers, emphasis
    800: '#40534C', // Dark green - Navigation, secondary headers
    600: '#677D6A', // Medium green - Buttons, links
  },
  
  // Accent colors
  accent: {
    gold: '#D6BD98', // Warm beige/gold - Premium accents, highlights
  },
  
  // Neutral colors
  neutral: {
    black: '#000000', // Pure black - Text, borders
    white: '#FFFFFF', // Pure white - Backgrounds, cards
    cream: '#F3EDE3', // Warm cream - Soft backgrounds
  },
  
  // Light greens - Backgrounds and subtle elements
  background: {
    100: '#E1F2E2', // Lightest green - Page backgrounds
    200: '#D8EAD3', // Very light green - Card backgrounds
    300: '#D3E2D2', // Light green - Hover states
    400: '#BAD9B1', // Medium light green - Selected states
  },
  
  // Semantic colors (using primary palette as base)
  semantic: {
    success: '#677D6A',
    warning: '#D6BD98',
    error: '#40534C', // Using dark green as error (more elegant than red)
    info: '#1A3636',
  }
} as const;

/**
 * Component-specific color mappings
 * Pre-defined color combinations for common UI patterns
 */
export const componentColors = {
  // Sidebar navigation
  sidebar: {
    background: colors.primary[900],
    text: colors.background[100],
    textSecondary: colors.background[300],
    accent: colors.accent.gold,
    hover: colors.primary[800],
    active: colors.primary[600],
  },
  
  // Main content area
  main: {
    background: colors.background[100],
    cardBackground: colors.neutral.white,
    border: colors.background[300],
  },
  
  // Forms and inputs
  form: {
    background: colors.neutral.white,
    border: colors.background[300],
    borderFocus: colors.primary[600],
    label: colors.primary[900],
    placeholder: colors.background[400],
  },
  
  // Buttons
  button: {
    primary: {
      background: colors.primary[600],
      text: colors.neutral.white,
      hover: colors.primary[800],
    },
    secondary: {
      background: colors.accent.gold,
      text: colors.primary[900],
      hover: colors.background[300],
    },
    ghost: {
      background: 'transparent',
      text: colors.primary[600],
      hover: colors.background[200],
    }
  },
  
  // Status indicators
  status: {
    confirmed: colors.primary[600],
    pending: colors.accent.gold,
    cancelled: colors.primary[800],
    checkedIn: colors.background[400],
  }
} as const;

/**
 * Tailwind CSS custom color configuration
 * Use this in tailwind.config.js to extend the default palette
 */
export const tailwindColors = {
  'una-primary': {
    900: '#1A3636',
    800: '#40534C', 
    600: '#677D6A',
  },
  'una-accent': {
    gold: '#D6BD98',
  },
  'una-neutral': {
    black: '#000000',
    cream: '#F3EDE3',
  },
  'una-bg': {
    100: '#E1F2E2',
    200: '#D8EAD3', 
    300: '#D3E2D2',
    400: '#BAD9B1',
  }
};

/**
 * CSS Custom Properties (CSS Variables)
 * For use in CSS files or styled-components
 */
export const cssVariables = `
  :root {
    --una-primary-900: #1A3636;
    --una-primary-800: #40534C;
    --una-primary-600: #677D6A;
    --una-accent-gold: #D6BD98;
    --una-neutral-black: #000000;
    --una-neutral-cream: #F3EDE3;
    --una-bg-100: #E1F2E2;
    --una-bg-200: #D8EAD3;
    --una-bg-300: #D3E2D2;
    --una-bg-400: #BAD9B1;
  }
`;
