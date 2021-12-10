import { useState } from 'react';

export interface TileProps {
  title: string;
  min?: number;
  max?: number;
}

const Tile = ({ title, min, max }: TileProps) => {
  return (
    <div className="border-2 rounded border-blue-500">
      <div className="p-2">
        {title}:<br></br> min. {min ? min : '-'} dB <br></br> max.{' '}
        {max ? max : '-'} dB
      </div>
    </div>
  );
};

export default Tile;
