const { withSuperjson } = require('next-superjson');

module.exports = withSuperjson()({
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.alias['mapbox-gl'] = 'maplibre-gl';
    return config;
  },
});
