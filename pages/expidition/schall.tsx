import LineChart from '@/components/LineChart';
import BarChart, { SeriesProps } from '@/components/BarChart';
import Tile from '@/components/Tile';
import Map from '@/components/Map';
import OsemSheet from '@/components/Schall/OsemSheet';
import { useExpeditionParams } from '@/hooks/useExpeditionParams';
import { DateTime } from 'luxon';

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

const Schall = () => {
  const { schule } = useExpeditionParams();

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
    <div className="flex flex-col">
      <div className="p-4">
        <h1 className="text-4xl">Schall</h1>
        <div className="font-semibold text-gray-500">Schule: {schule}</div>
      </div>
      <div className="flex flex-col sm:flex-row divide-x-2 divide-blue-500">
        <div className="flex-grow md:w-2/3 p-4">
          <div className="flex flex-row flex-wrap justify-evenly w-full">
            <Tile title="Eingang" min={10} max={66}></Tile>
            <Tile title="Straße" min={89} max={101}></Tile>
            <Tile title="Hof" min={70} max={81}></Tile>
            <Tile title="Flur" min={33} max={51}></Tile>
            <Tile title="Klingel" min={5} max={84}></Tile>
          </div>
          <div className="w-full overflow-auto pt-10">
            {/* <OsemSheet series={series}></OsemSheet> */}
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
        </div>
        <div className="flex-none md:w-1/3 p-4">
          <div className="rounded-xl overflow-hidden shadow mb-4">
            <Map width="100%" height={200} expedition="schall" />
          </div>
          <h2 className="text-xl">Auswertung</h2>
          <LineChart series={series} yaxis={yaxis} />
        </div>
      </div>
    </div>
  );
};

export default Schall;
