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
            DEFAULT: '#004c90',
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
            DEFAULT: '#9d78b4',
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
            DEFAULT: '#fbbd35',
          },
          temperatur: {
            DEFAULT: '#56bfc6',
          },
          bodenfeuchte: {
            DEFAULT: '#7d8bc5',
          },
          versiegelung: {
            light: '#5394d0',
            DEFAULT: '#004c90',
          },
          artenvielfalt: {
            light: '#bad580',
            DEFAULT: '#6bbe98',
          },
        },
      },
    },
  },
  plugins: [],
};
