import { fetcher } from '@/lib/fetcher';
import { Device, Measurement, Sensor } from '@/types/osem';
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
    `${process.env.NEXT_PUBLIC_OSEM_API}/boxes?format=geojson&grouptag=HU Explorers,${expedition},${schule}&full=true`,
  );

  // Get today´s date
  const today = DateTime.now().startOf('day').toUTC().toString();
  const fromDateParam = fromDate ? `from-date=${fromDate.toISOString()}` : '';
  const toDateParam = toDate ? `to-date=${toDate.toISOString()}` : '';

  console.info('useOsemData - dateRange: ', fromDateParam, toDateParam);

  const { data: measurements } = useSWR(
    boxes?.features.flatMap(b => {
      let to;
      if (b.properties.lastMeasurementAt) {
        to = b.properties.lastMeasurementAt;
      } else {
        to = today;
      }

      return b.properties.sensors.map(s => {
        let url = `${process.env.NEXT_PUBLIC_OSEM_API}/boxes/${b.properties._id}/data/${s._id}`;

        if (fromDateParam !== '' && toDateParam !== '') {
          url = `${url}?${fromDateParam}&${toDateParam}`;
        } else {
          url = `${url}?to-date=${to}`;
        }

        return url;
      });
    }),
    fetcher,
    { refreshInterval: live ? 60000 : 0 },
  );

  const [data, setData] = useState<
    { box: Feature<Point, Device>; sensor?: Sensor; measurements: any[] }[]
  >([]);

  useEffect(() => {
    if (measurements?.length > 0) {
      console.log('Use OseM Data: ', measurements);
      if (expedition === 'Schallpegel') {
        setData(
          boxes?.features.map((box, i) => ({
            box,
            measurements: measurements[i],
          })),
        );
      } else if (expedition === 'Artenvielfalt') {
        const temperatureTmp: Measurement[] = [];
        const bodenfeuchteTmp: Measurement[] = [];

        boxes.features.map((box, i) => {
          temperatureTmp.push(measurements[i === 0 ? 0 : i * 2]);
          bodenfeuchteTmp.push(measurements[i === 0 ? 1 : i * 2 + 1]);
        });

        const temperature = temperatureTmp
          .flatMap(value => value)
          .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();

            return dateB - dateA;
          });
        const bodenfeuchte = bodenfeuchteTmp
          .flatMap(value => value)
          .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();

            return dateB - dateA;
          });

        console.log('Sorted: ', temperature, bodenfeuchte);

        setData([
          {
            box: null,
            sensor: {
              title: 'Lufttemperatur',
              unit: '°C',
              sensorType: 'HDC1080',
              lastMeasurement: temperature[0],
            },
            measurements: temperature,
          },
          {
            box: null,
            sensor: {
              title: 'Bodenfeuchte',
              unit: '%',
              sensorType: 'SMT50',
              lastMeasurement: bodenfeuchte[0],
            },
            measurements: bodenfeuchte,
          },
        ]);
      }
    }
  }, [boxes, measurements, expedition]);

  return { data, boxes };
};
