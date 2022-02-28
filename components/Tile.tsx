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
      className={`rounded-xl ${
        color.bg ?? 'bg-blue-600'
      } text-white shadow-lg ${
        color.shadow ?? 'shadow-blue-100'
      } text-center aspect-square w-36 h-36 m-2`}
    >
      <div className="p-4 flex flex-col justify-between h-full">
        <span className="font-semibold text-xl">{title}</span>
        <hr></hr>
        <div className="flex flex-col">
          <span className="flex items-center justify-evenly">
            <VolumeUpIcon className="h-3 w-3" />
            <div>
              <span className="text-3xl font-light">{min ?? '-'}</span> dB
            </div>
          </span>
          <span className="flex items-center justify-evenly">
            <VolumeUpIcon className="h-5 w-5" />
            <div>
              <span className="text-3xl font-light">{max ?? '-'}</span> dB
            </div>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Tile;
