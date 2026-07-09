/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './**/*.html', '!./node_modules/**', '!./node_modules'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Playfair Display', 'serif'],
      },
      colors: {
        'river': '#0e4d64',
        'river-light': '#156377',
        'sand': '#f4f1ea',
        'sand-dark': '#e6e0d4',
        'gold': '#c9a96e',
        'gold-dark': '#7a5f24',
        // `stone` is defined as a scale so the default numbered shades (e.g. stone-600)
        // keep working, while `DEFAULT` preserves the original flat near-black (#3a3a3a)
        // used by the 32 `text-stone` usages.
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
  plugins: [],
};
