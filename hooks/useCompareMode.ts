import { useState } from 'react';
import { useBetween } from 'use-between';

const useCompareMode = () => {
  const [compare, setCompare] = useState<boolean>(false);

  return {
    compare,
    setCompare,
  };
};

const useSharedCompareMode = () => useBetween(useCompareMode);
export default useSharedCompareMode;
