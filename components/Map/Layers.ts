import type { LayerProps } from 'react-map-gl';

export const clusterLayer: LayerProps = {
  id: 'osem-data',
  type: 'circle',
  source: 'osem-data',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': '#5394d0',
    'circle-radius': 20,
  },
};

export const clusterCountLayer: LayerProps = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'osem-data',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-size': 12,
  },
};

export const unclusteredPointNameLayer: LayerProps = {
  id: 'unclustered-point-name',
  type: 'symbol',
  source: 'osem-data',
  filter: ['!', ['has', 'point_count']],
  layout: {
    'text-field': ['get', 'name'],
    'text-size': 12,
    'text-variable-anchor': ['top'],
    'text-offset': [0, 1],
  },
  paint: {},
};

export const unclusteredPointLayer: LayerProps = {
  id: 'unclustered-point',
  type: 'circle',
  source: 'osem-data',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-radius': 6,
    'circle-color': [
      'match',
      ['at', 1, ['get', 'grouptag']],
      'Schallpegel',
      '#6bbe98',
      'Artenvielfalt',
      '#ec656b',
      '#fff',
    ],
    'circle-stroke-width': 4,
    'circle-stroke-color': '#fff',
  },
};
