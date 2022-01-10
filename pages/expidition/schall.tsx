import LineChart from '@/components/LineChart';
import BarChart, { SeriesProps } from '@/components/BarChart';
import Tile from '@/components/Tile';
import Map from '@/components/Map';
import { useExpeditionParams } from '@/hooks/useExpeditionParams';
import useSWR from 'swr';
import { Feature, Point } from 'geojson';
import LayoutTile from '@/components/LayoutTile';
import { useEffect, useState } from 'react';
import { useTailwindColors } from '@/hooks/useTailwindColors';

export const schallColors = [
  { bg: 'bg-he-blue-light', shadow: 'shadow-he-blue-light' },
  { bg: 'bg-he-orange', shadow: 'shadow-he-orange' },
  { bg: 'bg-he-green', shadow: 'shadow-he-green' },
  { bg: 'bg-he-violet', shadow: 'shadow-he-violet' },
  { bg: 'bg-he-red', shadow: 'shadow-he-red' },
];

const Schall = () => {
  const { schule } = useExpeditionParams();

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
  const [series, setSeries] = useState([]);
  const [barSeries, setBarSeries] = useState([]);

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

  useEffect(() => {
    setSeries(
      data.map(e => ({
        name: e.box.properties.name,
        data: e.measurements.map(m => ({
          y: Number(m.value),
          x: new Date(m.createdAt),
        })),
      })),
    );

    setBarSeries(
      data.map(e => ({
        name: e.box.properties.name,
        data: barChartCategories.map(
          c =>
            e.measurements
              .map(m => Number(m.value))
              .filter(x => c[0] <= x && x <= c[1], c).length,
        ),
      })),
    );
  }, [data]);

  const colors = useTailwindColors();

  const barChartCategories = [
    [0, 19],
    [20, 39],
    [40, 59],
    [60, 79],
    [80, 99],
  ];

  const yaxis = {
    title: {
      text: 'Lautstärke in dB',
    },
  };

  return (
    <div className="flex flex-col h-full">
      {/* <div className="p-4">
        <h1 className="text-4xl">Schall</h1>
        <div className="font-semibold text-gray-500">Schule: {schule}</div>
      </div> */}
      <div className="flex flex-wrap h-full w-full">
        <LayoutTile>
          <div className="flex flex-row flex-wrap justify-evenly items-center h-full">
            {data?.map((e, i) => (
              <Tile
                key={i}
                title={e.box.properties.name.split('HU Explorer Schall')[1]}
                min={Math.min(...e.measurements.map(m => Number(m.value)))}
                max={Math.max(...e.measurements.map(m => Number(m.value)))}
                color={schallColors[i]}
              ></Tile>
            ))}
          </div>
        </LayoutTile>
        <LayoutTile>
          <div className="rounded-xl overflow-hidden shadow w-full h-full min-h-[300px]">
            <Map width="100%" height="100%" data={boxes} />
          </div>
        </LayoutTile>
        <LayoutTile>
          <div className="w-full h-full">
            <BarChart
              series={barSeries}
              yaxis={{
                title: {
                  text: 'Anzahl der Messungen',
                },
              }}
              xaxis={{
                categories: barChartCategories.map(
                  ([l, u]) => `${l} - ${u} dB`,
                ),
              }}
              colors={[
                colors.he.blue.light,
                colors.he.orange.DEFAULT,
                colors.he.green.DEFAULT,
                colors.he.violet.DEFAULT,
                colors.he.red.DEFAULT,
              ]}
            ></BarChart>
          </div>
        </LayoutTile>
        <LayoutTile>
          <div className="w-full h-full">
            <LineChart
              series={series}
              yaxis={yaxis}
              colors={[
                colors.he.blue.light,
                colors.he.orange.DEFAULT,
                colors.he.green.DEFAULT,
                colors.he.violet.DEFAULT,
                colors.he.red.DEFAULT,
              ]}
            />
          </div>
        </LayoutTile>
      </div>
    </div>
  );
};

export default Schall;
