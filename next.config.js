module.exports = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.alias['mapbox-gl'] = 'maplibre-gl';
    return config;
  },
};
