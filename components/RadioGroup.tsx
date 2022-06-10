import useSharedCompareDevices from '@/hooks/useCompareDevices';
import { Device, Sensor } from '@/types/osem';
import { Feature, Point } from 'geojson';
import { useState } from 'react';

const inactive =
  'rounded-l px-6 py-2 border-2 border-blue-600 text-blue-600 font-medium text-xs leading-tight uppercase hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out';
const active =
  'rounded-l px-6 py-2 border-2 bg-blue-600 border-blue-600 text-white font-medium text-xs leading-tight uppercase hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out';

export interface Props {
  sensor: Sensor;
  device: Feature<Point>;
}

export default function RadioGroupButton({ sensor, device }: Props) {
  const [selected, setSelected] = useState(false);
  const { setCompareDevices } = useSharedCompareDevices();

  const handleClick = () => {
    setSelected(!selected);

    setCompareDevices({
      enabled: !selected,
      device: device,
      sensor: sensor,
    });
  };

  return (
    <div className="w-full px-4">
      <div className="mx-auto inline-flex w-full max-w-md">
        <button
          className={`${selected ? active : inactive}`}
          onClick={handleClick}
        >
          {sensor.title}
          {selected ? (
            <div className="shrink-0 text-white">
              <CheckIcon className="h-6 w-6" />
            </div>
          ) : null}
        </button>
      </div>
    </div>
  );
}

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx={12} cy={12} r={12} fill="#fff" opacity="0.2" />
      <path
        d="M7 13l3 3 7-7"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
