import { fetcher } from '@/lib/fetcher';
import { Point, Feature } from 'geojson';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

export const useOsemData2 = (
  expedition: string,
  schule: string | string[],
  live: boolean = true,
) => {
  // fetch berlin data
  const { data: boxes } = useSWR<GeoJSON.FeatureCollection<Point>, any>(
    `${process.env.NEXT_PUBLIC_OSEM_API}/boxes?format=geojson&grouptag=HU Explorers,${expedition},${schule}`,
  );
  const { data: measurements } = useSWR(
    boxes?.features.flatMap(b => {
      return b.properties.sensors.map(s => {
        return `${process.env.NEXT_PUBLIC_OSEM_API}/boxes/${b.properties._id}/data/${s._id}`;
      });
    }),
    fetcher,
    { refreshInterval: live ? 60000 : 0 },
  );

  const [data, setData] = useState<
    { box: Feature<Point, any>; temperature: any[]; bodenfeuchte: any[] }[]
  >([]);

  useEffect(() => {
    if (measurements?.length > 0) {
      setData(
        boxes?.features.map((box, i) => ({
          box,
          temperature: measurements[i === 0 ? 0 : i * 2],
          bodenfeuchte: measurements[i === 0 ? 1 : i * 2 + 1],
        })),
      );
    }
  }, [boxes, measurements]);

  return { data, boxes };
};
