import LineChart from '@/components/LineChart';
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
      text: 'Lautstärke',
    },
  };

  return (
    <div className="flex flex-col">
      <div className="p-4">
        <h1 className="text-4xl">Schall</h1>
        <div className="font-semibold text-gray-500">Schule: {schule}</div>
      </div>
      <div className="flex flex-col sm:flex-row divide-x-2 divide-blue-500">
        <div className="flex-grow md:w-2/3 p-4">
          <div className="w-full overflow-auto">
            <OsemSheet series={series}></OsemSheet>
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
