import React, { useState } from 'react';
import ReactMapGL, { Source, Layer, LayerProps } from 'react-map-gl';

import 'maplibre-gl/dist/maplibre-gl.css';
import useSWR from 'swr';
import { useExpeditionParams } from '@/hooks/useExpeditionParams';

export interface MapProps {
  width: number | string;
  height: number | string;
  expedition?: string;
}

const layerStyle: LayerProps = {
  id: 'point',
  type: 'circle',
  paint: {
    'circle-radius': 5,
    'circle-color': '#007cbf',
  },
};

const Map = ({ width, height, expedition }: MapProps) => {
  const [viewport, setViewport] = useState({
    width: width,
    height: height,
    latitude: 52.5,
    longitude: 13.5,
    zoom: 7,
  });

  const { schule } = useExpeditionParams();

  // fetch berlin data
  const { data, error } = useSWR<GeoJSON.FeatureCollection, any>(
    `https://api.opensensemap.org/boxes?format=geojson&grouptag=hu-explorer ${expedition} ${schule}`,
  );

  return (
    <ReactMapGL
      {...viewport}
      onViewportChange={nextViewport => setViewport(nextViewport)}
      mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
    >
      {data && (
        <Source id="osem-data" type="geojson" data={data}>
          <Layer {...layerStyle} />
        </Source>
      )}
    </ReactMapGL>
  );
};

export default Map;
