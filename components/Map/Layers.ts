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
    'text-field': [
      'concat',
      [
        'match',
        ['at', 1, ['get', 'grouptag']],
        'Schallpegel',
        ['at', 3, ['get', 'grouptag']],
        'Artenvielfalt',
        ['at', 2, ['get', 'grouptag']],
        '',
      ],
      ' - ',
      ['get', 'name'],
    ],
    'text-size': 12,
    // 'text-variable-anchor': ['top'],
    'text-offset': [1, 0],
    'text-anchor': 'left',
    // "text-transform": 'uppercase'
  },
  paint: {
    'text-color': 'black',
    'text-halo-color': 'white',
    'text-halo-width': 2,
    'text-halo-blur': 1,
  },
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
      '#7d8bc5',
      'Artenvielfalt',
      '#bad581',
      '#fff',
    ],
    'circle-stroke-width': 4,
    'circle-stroke-color': '#fff',
  },
};
