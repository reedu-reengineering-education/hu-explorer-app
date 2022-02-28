import LineChart from '@/components/LineChart';
import BarChart from '@/components/BarChart';
import Tile from '@/components/Tile';
import Map from '@/components/Map';
import { useExpeditionParams } from '@/hooks/useExpeditionParams';
import LayoutTile from '@/components/LayoutTile';
import { useEffect, useState } from 'react';
import { useTailwindColors } from '@/hooks/useTailwindColors';
import { useOsemData } from '@/hooks/useOsemData';
import { PauseIcon } from '@heroicons/react/outline';
import { PlayIcon } from '@heroicons/react/solid';

export const schallColors = [
  { bg: 'bg-he-blue-light', shadow: 'shadow-he-blue-light/40' },
  { bg: 'bg-he-orange', shadow: 'shadow-he-orange/40' },
  { bg: 'bg-he-green', shadow: 'shadow-he-green/40' },
  { bg: 'bg-he-violet', shadow: 'shadow-he-violet/40' },
  { bg: 'bg-he-red', shadow: 'shadow-he-red/40' },
];

const Schall = () => {
  const { schule } = useExpeditionParams();

  const [live, setLive] = useState(true);
  const { data, boxes } = useOsemData('Schallpegel', schule, live);

  const [series, setSeries] = useState([]);
  const [barSeries, setBarSeries] = useState([]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="flex h-full flex-col">
      <div className="p-4">
        <div className="flex justify-between">
          <h1 className="text-4xl">Schall</h1>
          <>
            {!live && (
              <PlayIcon
                className="h-8 w-8 cursor-pointer transition hover:scale-110"
                onClick={() => setLive(!live)}
              />
            )}
            {live && (
              <PauseIcon
                className="h-8 w-8 cursor-pointer transition hover:scale-110"
                onClick={() => setLive(!live)}
              />
            )}
          </>
        </div>
        <div className="font-semibold text-gray-500">Schule: {schule}</div>
      </div>
      <div className="flex h-full w-full flex-wrap">
        <LayoutTile>
          <div className="flex h-full flex-row flex-wrap items-center justify-evenly">
            {data?.map((e, i) => (
              <Tile
                key={i}
                title={e.box.properties.name}
                min={
                  e.measurements.length > 0
                    ? Math.min(...e.measurements.map(m => Number(m.value)))
                    : undefined
                }
                max={
                  e.measurements.length > 0
                    ? Math.max(...e.measurements.map(m => Number(m.value)))
                    : undefined
                }
                color={schallColors[i]}
              ></Tile>
            ))}
          </div>
        </LayoutTile>
        <LayoutTile>
          <div className="h-full min-h-[300px] w-full overflow-hidden rounded-xl shadow">
            <Map width="100%" height="100%" data={boxes} />
          </div>
        </LayoutTile>
        <LayoutTile>
          <div className="h-full w-full">
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
          <div className="h-full w-full">
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
