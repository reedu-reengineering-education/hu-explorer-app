import { useState } from 'react';
import { useBetween } from 'use-between';

import { CompareDevice } from '@/types/osem';

const useCompareDevices = () => {
  const [compareDevices, setCompareDevices] = useState<CompareDevice>();

  return {
    compareDevices,
    setCompareDevices,
  };
};

const useSharedCompareDevices = () => useBetween(useCompareDevices);
export default useSharedCompareDevices;
