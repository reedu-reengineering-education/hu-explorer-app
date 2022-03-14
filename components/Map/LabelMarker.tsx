import React from 'react';
import { Marker, MapboxEvent } from 'react-map-gl';

export interface LabelMarkerProps {
  name: string;
  lat: number;
  lng: number;
  color?: string;
  onClick: (e: MapboxEvent<MouseEvent>) => void;
}

const LabelMarker = ({ name, lat, lng, color, onClick }: LabelMarkerProps) => {
  // const context = React.useContext(MapContext);

  // const [x, y] = context.viewport.project([lng, lat]);

  return (
    <Marker longitude={lng} latitude={lat} onClick={onClick}>
      <div
        style={{ position: 'absolute' }}
        className="flex w-fit cursor-pointer items-center rounded-full bg-white pr-2 pl-1 text-sm shadow hover:z-10 hover:shadow-lg"
      >
        <span
          className={`block h-3 w-3 ${
            color ?? 'bg-blue-500'
          } mr-1 rounded-full`}
        ></span>
        {name}
      </div>
    </Marker>
  );
};

export default LabelMarker;
