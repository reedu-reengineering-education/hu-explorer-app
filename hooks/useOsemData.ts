import { Point, Feature } from 'geojson';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
const { DateTime } = require('luxon');

export const useOsemData = (
  expedition: string,
  schule: string | string[],
  live: boolean = true,
) => {
  // fetch devices tagged with HU Explorer
  const { data: boxes } = useSWR<GeoJSON.FeatureCollection<Point>, any>(
    `${process.env.NEXT_PUBLIC_OSEM_API}/boxes?format=geojson&grouptag=HU Explorers,${expedition},${schule}`,
  );

  // Get today´s date
  const today = DateTime.now().startOf('day').toUTC().toString();

  const { data: measurements } = useSWR(
    boxes?.features.map(
      b =>
        `${process.env.NEXT_PUBLIC_OSEM_API}/boxes/${b.properties._id}/data/${b.properties.sensors[0]._id}?from-date=${today}`,
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
