import { format } from 'date-fns';
import { Sensor } from '@/types/osem';

export interface TileProps {
  sensor: Sensor;
  openChart: (sensor: Sensor) => void;
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

const MeasurementTile = ({ sensor, openChart }: TileProps) => {
  const { _id, title, unit } = sensor;

  const value = Number(sensor.lastMeasurement?.value);
  const color = tileColors[title] ?? 'bg-violet-500';

  const toggleChart = () => {
    if (typeof value === 'number' && !isNaN(value)) {
      openChart(sensor);
    }
  };

  return (
    <div
      key={_id}
      className={`h-30 w-30 m-1 flex aspect-square flex-col items-center justify-center rounded-xl p-2 shadow ${color}`}
      onClick={toggleChart}
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
    </div>
  );
};

export default MeasurementTile;
