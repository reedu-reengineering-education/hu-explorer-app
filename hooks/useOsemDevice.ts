import { fetcher } from '@/lib/fetcher';
import { Device, Measurement, Sensor } from '@/types/osem';
import { Point, Feature } from 'geojson';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
const { DateTime } = require('luxon');

export const useOsemDevice = (
  deviceId: string,
  fromDate?: Date,
  toDate?: Date,
) => {
  // Get device data
  const { data: device } = useSWR<Device>(
    `${process.env.NEXT_PUBLIC_OSEM_API}/boxes/${deviceId}`,
  );

  // Get today´s date
  const today = DateTime.now().startOf('day').toUTC().toString();
  const fromDateParam = fromDate ? `from-date=${fromDate.toISOString()}` : '';
  const toDateParam = toDate ? `to-date=${toDate.toISOString()}` : '';

  // Get measurements of all sensors
  const { data: measurements } = useSWR(
    device?.sensors.flatMap(sensor => {
      let to;
      if (sensor.lastMeasurement) {
        to = sensor.lastMeasurement.createdAt;
      } else {
        to = today;
      }

      let url = `${process.env.NEXT_PUBLIC_OSEM_API}/boxes/${device._id}/data/${sensor._id}`;

      if (fromDateParam !== '' && toDateParam !== '') {
        url = `${url}?${fromDateParam}&${toDateParam}`;
      } else {
        url = `${url}?to-date=${to}`;
      }

      return url;
    }),
    fetcher,
  );

  const [data, setData] = useState<
    { sensor: Sensor; measurements: Measurement[] }[]
  >([]);

  useEffect(() => {
    setData(
      device?.sensors.map((sensor, i) => ({
        sensor,
        measurements: measurements?.length > 0 ? measurements[i] : [],
      })),
    );
  }, [device, measurements]);

  return { device, data };
};
