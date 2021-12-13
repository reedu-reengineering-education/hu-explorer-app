import { VolumeUpIcon } from '@heroicons/react/solid';

export interface TileProps {
  title: string;
  min?: number;
  max?: number;
}

const Tile = ({ title, min, max }: TileProps) => {
  return (
    <div className="rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-200 text-center aspect-square w-28 h-28 m-2">
      <div className="p-4 flex flex-col justify-between h-full">
        <span className="font-semibold text-xl">{title}</span>
        <div className="flex flex-col">
          <span className="flex items-center">
            <VolumeUpIcon className="h-3 w-3 text-blue-50 mr-4" />
            {min ? min : '-'} dB
          </span>
          <span className="flex items-center">
            <VolumeUpIcon className="h-5 w-5 text-blue-50 mr-2" />
            {max ? max : '-'} dB
          </span>
        </div>
      </div>
    </div>
  );
};

export default Tile;
