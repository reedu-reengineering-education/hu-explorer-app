import { Device, Measurement } from '@/types/osem';
import {
  InformationCircleIcon,
  PresentationChartLineIcon,
} from '@heroicons/react/outline';
import { VolumeUpIcon } from '@heroicons/react/solid';
import { format, formatDistance, intervalToDuration } from 'date-fns';
import { Point, Feature } from 'geojson';
import { useState } from 'react';
import { ChartType } from './MeasurementTile';

export interface TileProps {
  title: string;
  min?: number;
  max?: number;
  color?: any;
  device?: Feature<Point, Device>;
  measurements?: Measurement[];
  charts?: ChartType[];
  openChart?: (chartType: ChartType, device: Feature<Point, Device>) => void;
}

const Tile = ({
  title,
  min,
  max,
  color,
  device,
  measurements,
  charts,
  openChart,
}: TileProps) => {
  const [showInformation, setShowInformation] = useState(false);

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
      } m-1 aspect-square h-36 w-36 text-center`}
    >
      <div className="flex h-full flex-col justify-between p-2">
        {showInformation ? (
          <>
            <kbd className="text-xs text-white">
              {formatDistance(
                new Date(measurements[measurements.length - 1].createdAt),
                new Date(measurements[0].createdAt),
              )}
            </kbd>
          </>
        ) : (
          <>
            <span className="text-lg font-semibold">{title}</span>
            <hr></hr>
            <div className="flex flex-col">
              <span className="flex items-center justify-evenly">
                <VolumeUpIcon className="h-3 w-3" />
                <div>
                  <span className="text-lg font-light">{min ?? '-'}</span> dB
                </div>
              </span>
              <span className="flex items-center justify-evenly">
                <VolumeUpIcon className="h-4 w-4" />
                <div>
                  <span className="text-lg font-light">{max ?? '-'}</span> dB
                </div>
              </span>
            </div>
          </>
        )}

        <div className="mt-2 inline-flex items-center justify-evenly border-t-2 pt-2">
          {measurements.length > 0 ? (
            <>
              <kbd className="text-xs text-white">
                {format(new Date(measurements[0].createdAt), 'dd.MM.yyyy')}
              </kbd>
              <InformationCircleIcon
                onClick={() => setShowInformation(!showInformation)}
                className="h-5 w-5 cursor-pointer"
              />
            </>
          ) : null}
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
