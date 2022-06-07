import { Sensor } from '@/types/osem';
import { useState } from 'react';

const inverse =
  'bg-white text-blue-600 hover:bg-blue-600:text-white focus:ring-white focus:ring-offset-blue-100';

export interface Props {
  sensor: Sensor;
}

export default function RadioGroupButton({ sensor }: Props) {
  const [selected, setSelected] = useState(false);

  return (
    <div className="w-full px-4">
      <div className="mx-auto w-full max-w-md">
        <button
          className={`${selected ? inverse : ''}`}
          onClick={() => setSelected(!selected)}
        >
          {sensor.title}
        </button>
      </div>
    </div>
  );
}
