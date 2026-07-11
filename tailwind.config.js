/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './credits.html', './attractions/**/*.html', './guides/**/*.html', './experiences/**/*.html'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Playfair Display', 'serif'],
      },
      opacity: {
        18: '0.18',
        22: '0.22',
        72: '0.72',
        78: '0.78',
        92: '0.92',
      },
      colors: {
        'river': '#0e4d64',
        'river-light': '#156377',
        'sand': '#f4f1ea',
        'sand-dark': '#e6e0d4',
        'gold': '#c9a96e',
        'gold-dark': '#5c4a1a',
        'stone': {
          DEFAULT: '#3a3a3a',
          50:  '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
      },
    },
  },
  safelist: ['hidden'],
  plugins: [],
};
