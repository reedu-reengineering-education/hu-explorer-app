import { useState } from 'react';
import { useBetween } from 'use-between';

import { Device } from '@/types/osem';

const useCompareDevices = () => {
  const [compareDevices, setCompareDevices] = useState<Device[]>();

  return {
    compareDevices,
    setCompareDevices,
  };
};

const useSharedCompareDevices = () => useBetween(useCompareDevices);
export default useSharedCompareDevices;
