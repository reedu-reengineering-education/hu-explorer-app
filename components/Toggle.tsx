import { useState } from 'react';
import { Switch } from '@headlessui/react';
import { Feature, Point } from 'geojson';
import { Sensor } from '@/types/osem';

export interface Props {
  device: Feature<Point>;
  sensor: Sensor;
  updateSeries: (
    enabled: boolean,
    device: Feature<Point>,
    sensor: Sensor,
  ) => void;
}

export default function Toggle({ updateSeries, device, sensor }: Props) {
  const [enabled, setEnabled] = useState(false);

  const onChange = (value: boolean) => {
    setEnabled(value);
    updateSeries(value, device, sensor);
  };

  return (
    <div className="py-2">
      <Switch
        checked={enabled}
        onChange={onChange}
        className={`${enabled ? 'bg-teal-900' : 'bg-teal-700'}
          relative inline-flex h-[24px] w-[55px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
      >
        <span className="sr-only">Use setting</span>
        <span
          aria-hidden="true"
          className={`${enabled ? 'translate-x-8' : 'translate-x-0'}
            pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
        />
      </Switch>
    </div>
  );
}
