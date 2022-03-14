import React, { useEffect, useState } from 'react';
import ReactMapGL, {
  Source,
  Layer,
  LayerProps,
  FlyToInterpolator,
  WebMercatorViewport,
  ViewportProps,
} from 'react-map-gl';

import { BBox, Feature, FeatureCollection, Point, Polygon } from 'geojson';

import geoViewport from '@mapbox/geo-viewport';
import bbox from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';

import LabelMarker from '@/components/Map/LabelMarker';
import { schallColors } from '@/pages/expidition/schall';

import 'maplibre-gl/dist/maplibre-gl.css';

export interface MapProps {
  width: number | string;
  height: number | string;
  onBoxSelect?: Function;
  data?: FeatureCollection<Point>;
  color?: boolean;
  expedition?: boolean;
  zoomLevel?: number;
}

const layerStyle: LayerProps = {
  id: 'point',
  type: 'circle',
  paint: {
    'circle-radius': 6,
    'circle-color': '#007cbf',
    'circle-stroke-width': 4,
    'circle-stroke-color': '#fff',
  },
};

const Map = ({
  width,
  height,
  data,
  onBoxSelect,
  expedition = false,
  color,
  zoomLevel = 13,
}: MapProps) => {
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

  const [bbox2, setBbox] = useState<Feature<Polygon>>();

  useEffect(() => {
    const bounds: BBox = geoViewport.bounds(
      [viewport.longitude, viewport.latitude],
      viewport.zoom,
      [viewport.width, viewport.height],
    );
    if (!bounds.includes(NaN)) {
      const poly = bboxPolygon(bounds);
      setBbox(poly);
    }
  }, [viewport]);

  useEffect(() => {
    if (expedition && mapLoaded && data?.features.length > 0) {
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

  const onMapClick = e => {
    if (viewport.zoom > zoomLevel) {
      return;
    }

    const feature = e.features[0];

    if (feature?.layer.source === 'osem-data') {
      onBoxSelect({
        ...feature,
        properties: {
          ...feature.properties,
          sensors: JSON.parse(feature.properties.sensors),
        },
      });
    } else {
      onBoxSelect(undefined);
    }
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
      onClick={!expedition && onMapClick}
    >
      {data && viewport.zoom <= zoomLevel && (
        <Source id="osem-data" type="geojson" data={data}>
          <Layer {...layerStyle} />
        </Source>
      )}
      {data?.features &&
        viewport.zoom > zoomLevel &&
        data.features.map((m, i) => (
          <LabelMarker
            key={i}
            name={m.properties.name}
            lat={m.geometry.coordinates[1]}
            lng={m.geometry.coordinates[0]}
            color={color && schallColors[i].bg}
            onClick={() => {
              onBoxSelect && onBoxSelect(m);
            }}
          ></LabelMarker>
        ))}
    </ReactMapGL>
  );
};

export default Map;
