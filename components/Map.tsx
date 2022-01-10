import React, { useEffect, useState } from 'react';
import ReactMapGL, {
  FlyToInterpolator,
  WebMercatorViewport,
  ViewportProps,
  MapContext,
} from 'react-map-gl';

import 'maplibre-gl/dist/maplibre-gl.css';
import bbox from '@turf/bbox';
import { FeatureCollection, Point } from 'geojson';
import { schallColors } from '@/pages/expidition/schall';

export interface MapProps {
  width: number | string;
  height: number | string;
  data?: FeatureCollection<Point>;
}

const LabelMarker = ({ name, lat, lng, color }) => {
  const context = React.useContext(MapContext);

  const [x, y] = context.viewport.project([lng, lat]);

  return (
    <div
      style={{ position: 'absolute', left: x - 10, top: y - 10 }}
      className="bg-white rounded-full w-fit pr-2 pl-1 text-sm shadow hover:z-10 flex items-center"
    >
      <span
        className={`block w-3 h-3 ${color ?? 'bg-blue-500'} rounded-full mr-1`}
      ></span>
      {name}
    </div>
  );
};

const Map = ({ width, height, data }: MapProps) => {
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
      mapStyle="mapbox://styles/mapbox/streets-v11"
    >
      {data?.features &&
        data.features.map((m, i) => (
          <LabelMarker
            key={i}
            name={m.properties.name.split('HU Explorer Schall')[1]}
            lat={m.geometry.coordinates[1]}
            lng={m.geometry.coordinates[0]}
            color={schallColors[i].bg}
          ></LabelMarker>
        ))}
    </ReactMapGL>
  );
};

export default Map;
