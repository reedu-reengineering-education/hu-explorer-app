import { Point, Feature } from 'geojson';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

export const useOsemData = (
  expedition: string,
  schule: string | string[],
  live: boolean = true,
) => {
  // fetch berlin data
  const { data: boxes } = useSWR<GeoJSON.FeatureCollection<Point>, any>(
    `${process.env.NEXT_PUBLIC_OSEM_API}/boxes?format=geojson&grouptag=HU Explorers,${expedition},${schule}`,
  );
  const { data: measurements } = useSWR(
    boxes?.features.map(
      b =>
        `${process.env.NEXT_PUBLIC_OSEM_API}/boxes/${b.properties._id}/data/${b.properties.sensors[0]._id}`,
    ),
    { refreshInterval: live ? 60000 : 0 },
  );

  const [data, setData] = useState<
    { box: Feature<Point, any>; measurements: any[] }[]
  >([]);

  useEffect(() => {
    if (measurements?.length > 0) {
      setData(
        boxes?.features.map((box, i) => ({
          box,
          measurements: measurements[i],
        })),
      );
    }
  }, [boxes, measurements]);

  return { data, boxes };
};
