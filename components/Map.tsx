import React, { useEffect, useState } from 'react';
import ReactMapGL, { Source, Layer, LayerProps } from 'react-map-gl';

import 'maplibre-gl/dist/maplibre-gl.css';
import useSWR from 'swr';
import LabelMarker from '@/components/Map/LabelMarker';
import { BBox, Feature, Point, Polygon } from 'geojson';

import geoViewport from '@mapbox/geo-viewport';
import bboxPolygon from '@turf/bbox-polygon';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

export interface MapProps {
  width: number | string;
  height: number | string;
  onBoxSelect?: Function;
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

const Map = ({ width, height, onBoxSelect }: MapProps) => {
  const [mapStyle, setMapStyle] = useState(
    'mapbox://styles/mapbox/streets-v11',
  );
  const [viewport, setViewport] = useState({
    width: width,
    height: height,
    latitude: 52.5,
    longitude: 13.5,
    zoom: 7,
  });

  const [bbox, setBbox] = useState<Feature<Polygon>>();

  useEffect(() => {
    const bbox: BBox = geoViewport.bounds(
      [viewport.longitude, viewport.latitude],
      viewport.zoom,
      [viewport.width, viewport.height],
    );
    if (!bbox.includes(NaN)) {
      const poly = bboxPolygon(bbox);
      setBbox(poly);
    }
  }, [viewport]);

  // fetch berlin data
  const { data, error } = useSWR<GeoJSON.FeatureCollection<Point>, any>(
    'https://api.opensensemap.org/boxes?bbox=12.398393,52.030190,14.062822,52.883716&format=geojson&exposure=outdoor&full=true',
  );

  const onMapClick = e => {
    if (viewport.zoom > 13) {
      return;
    }

    const feature = e.features[0];

    if (feature?.layer.source === 'osem-data') {
      console.log(feature.properties);
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
      mapStyle={mapStyle}
      onViewportChange={nextViewport => setViewport(nextViewport)}
      mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      onClick={onMapClick}
    >
      {data && viewport.zoom <= 13 && (
        <Source id="osem-data" type="geojson" data={data}>
          <Layer {...layerStyle} />
        </Source>
      )}
      {data?.features &&
        viewport.zoom > 13 &&
        data.features.map((m, i) => {
          if (booleanPointInPolygon(m.geometry.coordinates, bbox)) {
            return (
              <LabelMarker
                key={i}
                name={m.properties.name}
                lat={m.geometry.coordinates[1]}
                lng={m.geometry.coordinates[0]}
                onClick={() => {
                  onBoxSelect(m);
                }}
              ></LabelMarker>
            );
          }
        })}
    </ReactMapGL>
  );
};

export default Map;
