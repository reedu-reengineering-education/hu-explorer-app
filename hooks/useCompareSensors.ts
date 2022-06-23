import { useState } from 'react';
import { useBetween } from 'use-between';

import { Sensor } from '@/types/osem';
import { Feature, Point } from 'geojson';

interface SensorDevice {
  sensor: Sensor;
  device: Feature<Point>;
  active: boolean;
}

const useCompareSensors = () => {
  const [compareSensors, setCompareSensors] = useState<SensorDevice[]>([]);

  return {
    compareSensors,
    setCompareSensors,
  };
};

const useSharedCompareSensors = () => useBetween(useCompareSensors);
export default useSharedCompareSensors;
