import React, { useEffect, useRef, useState } from 'react';
import ReactMapGL, { Source, Layer } from 'react-map-gl';
import type { MapLayerMouseEvent } from 'react-map-gl';
import maplibregl, { Marker } from 'maplibre-gl';

import type { MapRef } from 'react-map-gl';
import type { GeoJSONSource } from 'react-map-gl';
import type { ViewState } from 'react-map-gl';
import type { LngLatLike } from 'react-map-gl';

import { FeatureCollection, Point } from 'geojson';

import bbox from '@turf/bbox';

import LabelMarker from '@/components/Map/LabelMarker';
import { schallColors } from '@/pages/expidition/schall';

import 'maplibre-gl/dist/maplibre-gl.css';
import {
  clusterCountLayer,
  clusterLayer,
  unclusteredPointLayer,
  unclusteredPointNameLayer,
} from './Map/Layers';

export interface MapProps {
  onBoxSelect?: Function;
  data?: FeatureCollection<Point>;
  color?: boolean;
  expedition?: boolean;
  zoomLevel?: number;
  filter?: any[];
}

const Map = ({
  data,
  onBoxSelect,
  expedition = false,
  color,
  zoomLevel = 13,
}: MapProps) => {
  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [viewport, setViewport] = useState<ViewState>({
    latitude: 52.5,
    longitude: 13.5,
    zoom: 7,
    bearing: 0,
    pitch: 0,
    padding: null,
  });

  useEffect(() => {
    if (expedition && mapLoaded && data?.features.length > 0) {
      flyToBbox();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded, data]);

  const flyToBbox = () => {
    // calculate the bounding box of the feature
    const [minLng, minLat, maxLng, maxLat] = bbox(data);

    mapRef.current.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding: 40, duration: 1000 },
    );
  };

  const onMapClick = (e: MapLayerMouseEvent) => {
    const feature = e.features[0];
    const clusterId = feature.layer.id;

    if (clusterId === 'osem-data') {
      const mapboxSource = mapRef.current.getSource(
        'osem-data',
      ) as GeoJSONSource;
      mapboxSource.getClusterExpansionZoom(
        feature.properties.cluster_id,
        (err, zoom) => {
          if (err) {
            return;
          }

          mapRef.current.easeTo({
            center: (feature.geometry as Point).coordinates as LngLatLike,
            zoom,
            duration: 500,
          });
        },
      );
    } else if (clusterId === 'unclustered-point') {
      onBoxSelect({
        ...feature,
        properties: {
          ...feature.properties,
          sensors: JSON.parse(feature.properties.sensors),
        },
      });
    }
  };

  const updateMarkers = () => {};

  const onRender = () => {
    if (!mapRef.current.isSourceLoaded('osem-data')) {
      return;
    }
    updateMarkers();
  };

  return (
    <ReactMapGL
      initialViewState={viewport}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      onLoad={() => setMapLoaded(true)}
      mapStyle={`https://api.maptiler.com/maps/5eee3573-4adb-4f2e-b525-c9ffa1957ad3/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`}
      onClick={onMapClick}
      onRender={onRender}
      ref={mapRef}
      interactiveLayerIds={[clusterLayer.id, unclusteredPointLayer.id]}
      mapLib={maplibregl}
      attributionControl={true}
    >
      {data && !expedition && viewport.zoom <= zoomLevel && (
        <Source
          id="osem-data"
          type="geojson"
          cluster={true}
          // clusterProperties={{
          //   // keep separate counts for each magnitude category in a cluster
          //   'mag1': ['+', ['case', ["==", "Artenvielfalt", ['at', 1, ['get','grouptag']]], 1, 0]],
          //   'mag2': ['+', ['case', ["==", "Schallpegel", ['at', 1, ['get','grouptag']]], 1, 0]],
          // }}
          clusterMaxZoom={14}
          clusterRadius={50}
          data={data}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
          <Layer {...unclusteredPointNameLayer} />
        </Source>
      )}
      {data &&
        expedition &&
        data?.features &&
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
