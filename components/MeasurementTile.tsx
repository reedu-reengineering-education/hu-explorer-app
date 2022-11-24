import { format } from 'date-fns';
import { Sensor } from '@/types/osem';
import {
  ChartPieIcon,
  ChartSquareBarIcon,
  PresentationChartLineIcon,
  XCircleIcon,
} from '@heroicons/react/outline';

export enum ChartType {
  line = 'line',
  pie = 'pie',
  column = 'column',
}

export interface TileProps {
  sensor: Sensor;
  charts: ChartType[];
  openChart: (chartType: ChartType, sensor: Sensor) => void;
}

const tileColors = {
  Lufttemperatur: 'bg-he-yellow',
  Bodenfeuchte: 'bg-he-blue',
  'rel. Luftfeuchte': 'bg-blue-500',
  'PM2.5': 'bg-slate-500',
  PM10: 'bg-stone-500',
  Luftdruck: 'bg-teal-500',
  Beleuchtungsstärke: 'bg-amber-400',
  Versiegelung: 'bg-he-red',
  'Simpson-Index': 'bg-he-green',
  'UV-Intensität': 'bg-green-400',
  Lautstärke: 'bg-teal-500',
};

const MeasurementTile = ({ sensor, charts, openChart }: TileProps) => {
  const { _id, title, unit } = sensor;

  const value = Number(sensor.lastMeasurement?.value);
  const color = tileColors[title] ?? 'bg-violet-500';

  const toggleChart = (chartType: ChartType) => {
    if (typeof value === 'number' && !isNaN(value)) {
      openChart(chartType, sensor);
    }
  };

  return (
    <div
      key={_id}
      className={`h-30 w-30 m-1 flex aspect-square flex-col items-center justify-center rounded-xl p-2 shadow ${color}`}
    >
      <h1 className="mb-2 max-w-full overflow-hidden overflow-ellipsis text-xs font-bold text-white">
        {title}
      </h1>
      <h1 className="text-lg font-semibold text-white">
        {isNaN(value) ? '--' : value.toFixed(1)} {unit}
      </h1>
      <div className="mt-2 border-t-2">
        {sensor.lastMeasurement && (
          <kbd className="text-xs text-white">
            {format(
              new Date(sensor.lastMeasurement?.createdAt),
              'dd.MM.yyyy HH:mm',
            )}
          </kbd>
        )}
      </div>
      <div className="mt-2 flex w-full justify-evenly border-t-2 pt-2">
        {charts.includes(ChartType.line) && (
          <PresentationChartLineIcon
            className="h-5 w-5 cursor-pointer text-white"
            onClick={() => toggleChart(ChartType.line)}
          />
        )}
        {charts.includes(ChartType.pie) && (
          <ChartPieIcon
            className="h-5 w-5 cursor-pointer text-white"
            onClick={() => toggleChart(ChartType.pie)}
          />
        )}
        {charts.includes(ChartType.column) && (
          <ChartSquareBarIcon
            className="h-5 w-5 cursor-pointer text-white"
            onClick={() => toggleChart(ChartType.column)}
          />
        )}
      </div>
    </div>
  );
};

export default MeasurementTile;
