import { Point, Feature } from 'geojson';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

export const useOsemData = (schule: string | string[]) => {
  // fetch berlin data
  const { data: boxes } = useSWR<GeoJSON.FeatureCollection<Point>, any>(
    `https://api.opensensemap.org/boxes?format=geojson&grouptag=hu-explorer schall ${schule}`,
  );
  const { data: measurements } = useSWR(
    boxes?.features.map(
      b =>
        `https://api.opensensemap.org/boxes/${b.properties._id}/data/${b.properties.sensors[0]._id}`,
    ),
    { refreshInterval: 60000 },
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
