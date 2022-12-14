import { Device } from '@/types/osem';
import { PresentationChartLineIcon } from '@heroicons/react/outline';
import { VolumeUpIcon } from '@heroicons/react/solid';
import { Point, Feature } from 'geojson';
import { ChartType } from './MeasurementTile';

export interface TileProps {
  title: string;
  min?: number;
  max?: number;
  color?: any;
  device?: Feature<Point, Device>;
  charts?: ChartType[];
  openChart?: (chartType: ChartType, device: Feature<Point, Device>) => void;
}

const Tile = ({
  title,
  min,
  max,
  color,
  device,
  charts,
  openChart,
}: TileProps) => {
  const toggleChart = (chartType: ChartType) => {
    if (device) {
      openChart(chartType, device);
    }
  };

  return (
    <div
      className={`rounded-xl ${
        color.bg ?? 'bg-blue-600'
      } text-white shadow-lg ${
        color.shadow ?? 'shadow-blue-100'
      } m-2 aspect-square h-36 w-36 text-center`}
    >
      <div className="flex h-full flex-col justify-between p-4">
        <span className="text-xl font-semibold">{title}</span>
        <hr></hr>
        <div className="flex flex-col">
          <span className="flex items-center justify-evenly">
            <VolumeUpIcon className="h-3 w-3" />
            <div>
              <span className="text-xl font-light">{min ?? '-'}</span> dB
            </div>
          </span>
          <span className="flex items-center justify-evenly">
            <VolumeUpIcon className="h-5 w-5" />
            <div>
              <span className="text-xl font-light">{max ?? '-'}</span> dB
            </div>
          </span>
        </div>
        <div className="mt-2 flex w-full justify-evenly border-t-2 pt-2">
          {charts.includes(ChartType.line) && (
            <PresentationChartLineIcon
              className="h-5 w-5 cursor-pointer text-white"
              onClick={() => toggleChart(ChartType.line)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Tile;
