import useSharedCompareSensors from '@/hooks/useCompareSensors';
import { Sensor } from '@/types/osem';
import { Feature, Point } from 'geojson';
import { useState } from 'react';

const inverse =
  'py-2 px-6 text-md border-2 rounded-md text-gray-500 bg-white border-green-500 bg-green-200 bg-opacity-10 hover:bg-blue-600:text-white focus:ring-white focus:ring-offset-blue-100';
const notSelected = 'py-2 px-6 text-md text-gray-500 border-2 rounded-md';

export interface Props {
  sensor: Sensor;
  device: Feature<Point>;
}

export default function RadioGroupButton({ sensor, device }: Props) {
  const [selected, setSelected] = useState(false);
  const { setCompareSensors } = useSharedCompareSensors();

  const handleClick = () => {
    setSelected(!selected);

    const sensorDevice = {
      sensor: sensor,
      active: !selected,
      device: device,
    };

    setCompareSensors([sensorDevice]);
  };

  return (
    <div className="pr-2">
      <div className="mx-auto w-full max-w-md">
        <button
          className={`${selected ? inverse : notSelected}`}
          onClick={handleClick}
        >
          <div className="flex flex-col">
            <span className="text-sm">{device.properties.name}</span>
            <span>{sensor.title}</span>
          </div>
        </button>
      </div>
    </div>
  );
}
