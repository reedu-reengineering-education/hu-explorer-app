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
      className="bg-white rounded-full w-fit pr-2 pl-1 text-sm shadow hover:z-10 flex items-center cursor-pointer"
      onClick={onClick}
    >
      <span
        className={`block w-3 h-3 ${color ?? 'bg-blue-500'} rounded-full mr-1`}
      ></span>
      {name}
    </div>
  );
};

export default LabelMarker;
