import React, { useEffect, useState } from 'react';
import ReactMapGL, {
  Source,
  Layer,
  LayerProps,
  FlyToInterpolator,
  WebMercatorViewport,
  ViewportProps,
  MapContext,
} from 'react-map-gl';

import 'maplibre-gl/dist/maplibre-gl.css';
import useSWR from 'swr';
import { useExpeditionParams } from '@/hooks/useExpeditionParams';

import bbox from '@turf/bbox';
import { Point } from 'geojson';

export interface MapProps {
  width: number | string;
  height: number | string;
  expedition?: string;
}

const LabelMarker = ({ name, lat, lng }) => {
  const context = React.useContext(MapContext);

  const [x, y] = context.viewport.project([lng, lat]);

  return (
    <div
      style={{ position: 'absolute', left: x - 10, top: y - 10 }}
      className="bg-white rounded-full w-fit pr-2 pl-1 text-sm shadow hover:z-10 flex items-center"
    >
      <span className="block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
      {name}
    </div>
  );
};

const Map = ({ width, height, expedition }: MapProps) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [viewport, setViewport] = useState<ViewportProps>({
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
  const { data, error } = useSWR<GeoJSON.FeatureCollection<Point>, any>(
    `https://api.opensensemap.org/boxes?format=geojson&grouptag=hu-explorer ${expedition} ${schule}`,
  );

  useEffect(() => {
    if (mapLoaded && data?.features.length > 0) {
      flyToBbox();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded, data]);

  const flyToBbox = () => {
    // calculate the bounding box of the feature
    const [minLng, minLat, maxLng, maxLat] = bbox(data);
    // construct a viewport instance from the current state
    const vp = new WebMercatorViewport({
      ...viewport,
      width: viewport.width,
      height: viewport.height,
    });
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
      transitionDuration: 1000,
      transitionInterpolator: new FlyToInterpolator({ speed: 1.2 }),
    });
  };

  return (
    <ReactMapGL
      {...viewport}
      height={height}
      width={width}
      onViewportChange={setViewport}
      mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      onLoad={() => setMapLoaded(true)}
    >
      {data?.features &&
        data.features.map((m, i) => (
          <LabelMarker
            key={i}
            name={m.properties.name.split('HU Explorer Schall')[1]}
            lat={m.geometry.coordinates[1]}
            lng={m.geometry.coordinates[0]}
          ></LabelMarker>
        ))}
    </ReactMapGL>
  );
};

export default Map;
