import React, { useEffect, useState } from 'react';
import ReactMapGL, {
  Source,
  Layer,
  LayerProps,
  FlyToInterpolator,
  WebMercatorViewport,
  LinearInterpolator,
} from 'react-map-gl';

import 'maplibre-gl/dist/maplibre-gl.css';
import useSWR from 'swr';
import { useExpeditionParams } from '@/hooks/useExpeditionParams';

import bbox from '@turf/bbox';

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
  const [mapLoaded, setMapLoaded] = useState(false);
  const [viewport, setViewport] = useState({
    latitude: 52.5,
    longitude: 13.5,
    zoom: 7,
    bearing: 0,
    pitch: 0,
    height: 100, // just some random defaults
    width: 100, // just some random defaults
  });

  const { schule } = useExpeditionParams();

  // fetch berlin data
  const { data, error } = useSWR<GeoJSON.FeatureCollection, any>(
    `https://api.opensensemap.org/boxes?format=geojson&grouptag=hu-explorer ${expedition} ${schule}`,
  );

  useEffect(() => {
    if (mapLoaded && data.features.length > 0) {
      flyToBbox();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded, data]);

  const flyToBbox = () => {
    // calculate the bounding box of the feature
    const [minLng, minLat, maxLng, maxLat] = bbox(data);
    // construct a viewport instance from the current state
    const vp = new WebMercatorViewport(viewport);
    const { longitude, latitude, zoom } = vp.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      {
        padding: 20,
      },
    );

    setViewport({
      ...viewport,
      longitude,
      latitude,
      zoom,
      // transitionInterpolator: new FlyToInterpolator({ speed: 1.2 }),
      // transitionDuration: 1000,
    });
  };

  return (
    <ReactMapGL
      {...viewport}
      height={height}
      width={width}
      onViewportChange={setViewport}
      mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      onClick={flyToBbox}
      onLoad={() => setMapLoaded(true)}
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
