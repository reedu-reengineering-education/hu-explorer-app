import React from 'react';
import { MapContext } from 'react-map-gl';

export interface LabelMarkerProps {
  name: string;
  lat: number;
  lng: number;
  color?: string;
  onClick: React.MouseEventHandler<HTMLDivElement>;
}

const LabelMarker = ({ name, lat, lng, color, onClick }: LabelMarkerProps) => {
  const context = React.useContext(MapContext);

  const [x, y] = context.viewport.project([lng, lat]);

  return (
    <div
      style={{ position: 'absolute', left: x - 10, top: y - 10 }}
      className="flex w-fit cursor-pointer items-center rounded-full bg-white pr-2 pl-1 text-sm shadow hover:z-10 hover:shadow-lg"
      onClick={onClick}
    >
      <span
        className={`block h-3 w-3 ${color ?? 'bg-he-violet'} mr-1 rounded-full`}
      ></span>
      {name}
    </div>
  );
};

export default LabelMarker;
