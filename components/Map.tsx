import React, { useState } from 'react';
import ReactMapGL, { Source, Layer, LayerProps } from 'react-map-gl';

import 'maplibre-gl/dist/maplibre-gl.css';
import useSWR from 'swr';

export interface MapProps {
  width: number | string;
  height: number | string;
}

const layerStyle: LayerProps = {
  id: 'point',
  type: 'circle',
  paint: {
    'circle-radius': 5,
    'circle-color': '#007cbf',
  },
};

const Map = ({ width, height }: MapProps) => {
  const [viewport, setViewport] = useState({
    width: width,
    height: height,
    latitude: 52.5,
    longitude: 13.5,
    zoom: 7,
  });

  // fetch berlin data
  const { data, error } = useSWR<GeoJSON.FeatureCollection, any>(
    'https://api.opensensemap.org/boxes?bbox=12.398393,52.030190,14.062822,52.883716&format=geojson&exposure=outdoor',
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
