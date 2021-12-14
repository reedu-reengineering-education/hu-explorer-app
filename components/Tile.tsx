import { VolumeUpIcon } from '@heroicons/react/solid';

export interface TileProps {
  title: string;
  min?: number;
  max?: number;
  color?: any;
}

const Tile = ({ title, min, max, color }: TileProps) => {
  return (
    <div
      className={`rounded-lg ${
        color.bg ?? 'bg-blue-600'
      } text-white shadow-lg ${
        color.shadow ?? 'shadow-blue-100'
      } text-center aspect-square w-32 h-32 m-2`}
    >
      <div className="p-4 flex flex-col justify-between h-full">
        <span className="font-semibold text-xl">{title}</span>
        <div className="flex flex-col">
          <span className="flex items-center justify-evenly">
            <VolumeUpIcon className="h-3 w-3" />
            {min ? min : '-'} dB
          </span>
          <span className="flex items-center  justify-evenly">
            <VolumeUpIcon className="h-5 w-5" />
            {max ? max : '-'} dB
          </span>
        </div>
      </div>
    </div>
  );
};

export default Tile;
