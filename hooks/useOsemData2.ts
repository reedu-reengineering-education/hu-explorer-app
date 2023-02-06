import { fetcher } from '@/lib/fetcher';
import { Point, Feature } from 'geojson';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
const { DateTime } = require('luxon');

export const useOsemData2 = (
  expedition: string,
  schule: string | string[],
  live: boolean = true,
) => {
  const { data: boxes } = useSWR<GeoJSON.FeatureCollection<Point>, any>(
    `${process.env.NEXT_PUBLIC_OSEM_API}/boxes?format=geojson&grouptag=HU Explorers,${expedition},${schule}&full=true`,
  );

  // Get today´s date
  const today = DateTime.now().startOf('day').toUTC().toString();
  const { data: measurements } = useSWR(
    boxes?.features.flatMap(b => {
      return b.properties.sensors.map(s => {
        return `${process.env.NEXT_PUBLIC_OSEM_API}/boxes/${b.properties._id}/data/${s._id}?to-date=${s.lastMeasurement.createdAt}`;
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
