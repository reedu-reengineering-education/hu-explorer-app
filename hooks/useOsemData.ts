import { Device, Sensor } from '@/types/osem';
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
  const { data: boxes } = useSWR<GeoJSON.FeatureCollection<Point, Device>, any>(
    `${process.env.NEXT_PUBLIC_OSEM_API}/boxes?format=geojson&grouptag=HU Explorers,${expedition},${schule}`,
  );

  // Get today´s date
  const today = DateTime.now().startOf('day').toUTC().toString();
  const fromDateParam = fromDate ? `from-date=${fromDate.toISOString()}` : '';
  const toDateParam = toDate ? `to-date=${toDate.toISOString()}` : '';

  console.info('useOsemData - dateRange: ', fromDateParam, toDateParam);

  const { data: measurements } = useSWR(
    boxes?.features.map(b => {
      let to;
      if (b.properties.lastMeasurementAt) {
        to = b.properties.lastMeasurementAt;
      } else {
        to = today;
      }

      let url = `${process.env.NEXT_PUBLIC_OSEM_API}/boxes/${b.properties._id}/data/${b.properties.sensors[0]._id}`;

      if (fromDateParam !== '' && toDateParam !== '') {
        url = `${url}?${fromDateParam}&${toDateParam}`;
      } else {
        url = `${url}?to-date=${to}`;
      }

      return url;
    }),
    { refreshInterval: live ? 60000 : 0 },
  );

  const [data, setData] = useState<
    { box: Feature<Point, Device>; sensor?: Sensor; measurements: any[] }[]
  >([]);

  useEffect(() => {
    if (measurements?.length > 0) {
      if (expedition === 'Schallpegel') {
        setData(
          boxes?.features.map((box, i) => ({
            box,
            measurements: measurements[i],
          })),
        );
      } else if (expedition === 'Artenvielfalt') {
        setData([
          {
            box: null,
            sensor: {
              title: 'Lufttemperatur',
              unit: '°C',
              sensorType: 'HDC1080',
            },
            measurements: [],
          },
          {
            box: null,
            sensor: {
              title: 'Bodenfeuchte',
              unit: '%',
              sensorType: 'SMT50',
            },
            measurements: [],
          },
        ]);
      }
    }
  }, [boxes, measurements]);

  return { data, boxes };
};
