import React, { useState } from 'react';

import { useExpeditionParams } from '@/hooks/useExpeditionParams';
import { Button } from '@/components/Elements/Button';
import InputSheet from '@/components/Artenvielfalt/InputSheet';
import OsemSheet from '@/components/Artenvielfalt/OsemSheet';
import LineChart from '@/components/LineChart';
import Map from '@/components/Map';
import { DateTime } from 'luxon';

const generateData = (range: number) => {
  return Array.from({ length: 10 }, (_, i) => {
    return {
      y: Math.floor(Math.random() * range) + 1,
      x: DateTime.local(2021, 12, 8, 13, 0, 0)
        .plus({ minutes: i })
        .toUTC()
        .toString(),
    };
  });
};

const series = [
  {
    name: 'Temperatur',
    data: generateData(50),
  },
  {
    name: 'Bodenfeuchte',
    data: generateData(100),
  },
  {
    name: 'Temperatur senseBox 2',
    data: generateData(50),
  },
  {
    name: 'Bodenfeuchte senseBox 2',
    data: generateData(100),
  },
];

const tabs = [
  {
    title: 'Artenvielfalt',
    component: <InputSheet />,
  },
  {
    title: 'Messwerte',
    component: <OsemSheet series={series} />,
  },
];

const Artenvielfalt = () => {
  const { schule, gruppe } = useExpeditionParams();
  const [tab, setTab] = useState(0);

  const yaxis: ApexYAxis[] = [
    {
      seriesName: 'Temperatur',
      showAlways: true,
      title: {
        text: 'Temperatur in °C',
      },
    },
    {
      seriesName: 'Bodenfeuchte',
      showAlways: true,
      opposite: true,
      title: {
        text: 'Bodenfeuchte in %',
      },
    },
  ];

  return (
    <div className="flex flex-col">
      <div className="p-4">
        <h1 className="text-4xl">Artenvielfalt</h1>
        <div className="font-semibold text-gray-500">Schule: {schule}</div>
        <div className="font-semibold text-gray-500">Gruppe: {gruppe}</div>
      </div>
      <div className="flex flex-col sm:flex-row divide-x-2 divide-blue-500">
        <div className="flex-grow md:w-2/3 p-4">
          <div className="flex justify-around rounded-lg bg-gray-100 p-2 mb-2">
            {tabs.map((t, i) => (
              <Button
                onClick={() => setTab(i)}
                variant={tab === i ? 'primary' : 'inverse'}
                key={`artenvielfalt_tab_${i}`}
                className="w-full text-center"
              >
                {t.title}
              </Button>
            ))}
          </div>
          <div className="w-full overflow-auto">{tabs[tab].component}</div>
        </div>
        <div className="flex-none md:w-1/3 p-4">
          <div className="rounded-xl overflow-hidden shadow mb-4">
            <Map width="100%" height={200} expedition="artenvielfalt" />
          </div>
          <h2 className="text-xl">Auswertung</h2>
          <LineChart series={series} yaxis={yaxis}></LineChart>
        </div>
      </div>
    </div>
  );
};

export default Artenvielfalt;
