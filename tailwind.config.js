module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        he: {
          blue: {
            light: '#5394d0',
            DEFAULT: '#5394d0',
          },
          green: {
            light: '#bad580',
            DEFAULT: '#6bbe98',
          },
          aqua: {
            DEFAULT: '#56bfc6',
          },
          lilac: {
            DEFAULT: '#7d8bc5',
          },
          violet: {
            DEFAULT: '#9b78b4',
          },
          magenta: {
            DEFAULT: '#e175ac',
          },
          red: {
            DEFAULT: '#ec656b',
          },
          orange: {
            DEFAULT: '#f6a03e',
          },
          yellow: {
            DEFAULT: '#f6a03e',
          },
          lufttemperatur: {
            DEFAULT: '#5394d0',
          },
          bodenfeuchte: {
            DEFAULT: '#f6a03e',
          },
          undurchlaessigkeit: {
            light: '#5394d0',
            DEFAULT: '#6bbe98',
          },
          artenvielfalt: {
            light: '#bad580',
            DEFAULT: '#ec656b',
          },
          lautstärke: {
            DEFAULT: '#14B8A6',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
};
