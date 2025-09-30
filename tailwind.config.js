module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // UNA Hotel Brand Colors
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
      },
      fontFamily: {
        'primary': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'heading': ['Playfair Display', 'Georgia', 'Times New Roman', 'serif'],
        'mono': ['JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 'monospace'],
      }
    },
  },
  plugins: [],
}