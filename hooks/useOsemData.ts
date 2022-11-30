import { Point, Feature } from 'geojson';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
const { DateTime } = require('luxon');

export const useOsemData = (
  expedition: string,
  schule: string | string[],
  live: boolean = true,
  fromDate?: Date,
  toDate?: Date,
) => {
  // fetch devices tagged with HU Explorer
  const { data: boxes } = useSWR<GeoJSON.FeatureCollection<Point>, any>(
    `${process.env.NEXT_PUBLIC_OSEM_API}/boxes?format=geojson&grouptag=HU Explorers,${expedition},${schule}`,
  );

  // Get today´s date
  const today = DateTime.now().startOf('day').toUTC().toString();
  const from = fromDate ? `from-date=${fromDate.toISOString()}` : '';

  const { data: measurements } = useSWR(
    boxes?.features.map(b => {
      let to;
      if (b.properties.lastMeasurementAt) {
        to = b.properties.lastMeasurementAt;
      } else {
        to = today;
      }
      return `${process.env.NEXT_PUBLIC_OSEM_API}/boxes/${b.properties._id}/data/${b.properties.sensors[0]._id}?to-date=${to}`;
    }),
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
