import LineChart from '@/components/LineChart';
import BarChart, { SeriesProps } from '@/components/BarChart';
import Tile from '@/components/Tile';
import Map from '@/components/Map';
import { useExpeditionParams } from '@/hooks/useExpeditionParams';
import { DateTime } from 'luxon';
import useSWR from 'swr';
import { Point } from 'geojson';
import LayoutTile from '@/components/LayoutTile';

const generateData = () => {
  return Array.from({ length: 10 }, (_, i) => {
    return {
      y: Math.floor(Math.random() * 120) + 1,
      x: DateTime.local(2021, 12, 8, 13, 0, 0)
        .plus({ minutes: i })
        .toUTC()
        .toString(),
    };
  });
};

export const schallColors = [
  { bg: 'bg-blue-500', shadow: 'shadow-blue-100' },
  { bg: 'bg-amber-500', shadow: 'shadow-amber-100' },
  { bg: 'bg-emerald-500', shadow: 'shadow-emerald-100' },
  { bg: 'bg-fuchsia-500', shadow: 'shadow-fuchsia-100' },
  { bg: 'bg-rose-500', shadow: 'shadow-rose-100' },
];

const Schall = () => {
  const { schule } = useExpeditionParams();

  // fetch berlin data
  const { data, error } = useSWR<GeoJSON.FeatureCollection<Point>, any>(
    `https://api.opensensemap.org/boxes?format=geojson&grouptag=hu-explorer schall ${schule}`,
  );

  const series = [
    {
      name: 'Eingang',
      data: generateData(),
    },
    {
      name: 'Straße',
      data: generateData(),
    },
    {
      name: 'Hof',
      data: generateData(),
    },
    {
      name: 'Flur',
      data: generateData(),
    },
    {
      name: 'Klingel',
      data: generateData(),
    },
  ];

  const yaxis = {
    title: {
      text: 'Lautstärke in dB',
    },
  };

  const barSeries = [
    {
      name: 'Eingang',
      data: [44, 55, 57, 56, 61, 58],
    },
    {
      name: 'Straße',
      data: [76, 85, 101, 98, 87, 105],
    },
    {
      name: 'Hof',
      data: [35, 41, 36, 26, 45, 48],
    },
    {
      name: 'Flur',
      data: [35, 41, 36, 26, 45, 48],
    },
    {
      name: 'Klingel',
      data: [35, 41, 36, 26, 45, 48],
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* <div className="p-4">
        <h1 className="text-4xl">Schall</h1>
        <div className="font-semibold text-gray-500">Schule: {schule}</div>
      </div> */}
      <div className="flex flex-wrap h-full w-full">
        <LayoutTile>
          <div className="flex flex-row flex-wrap justify-evenly items-center h-full">
            {data?.features?.map((e, i) => (
              <Tile
                key={i}
                title={e.properties.name.split('HU Explorer Schall')[1]}
                min={10}
                max={66}
                color={schallColors[i]}
              ></Tile>
            ))}
          </div>
        </LayoutTile>
        <LayoutTile>
          <div className="rounded-xl overflow-hidden shadow w-full h-full min-h-[300px]">
            <Map width="100%" height="100%" data={data} />
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
                categories: [
                  '0 - 10 dB',
                  '10 - 20 dB',
                  '20 - 30 dB',
                  '30 - 40 dB',
                  '40 - 50 dB',
                  '50 - 60 dB',
                ],
              }}
            ></BarChart>
          </div>
        </LayoutTile>
        <LayoutTile>
          <div className="w-full h-full">
            <LineChart series={series} yaxis={yaxis} />
          </div>
        </LayoutTile>
      </div>
    </div>
  );
};

export default Schall;
