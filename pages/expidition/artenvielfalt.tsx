import React, { useState } from 'react';

import { useExpeditionParams } from '@/hooks/useExpeditionParams';
import InputSheet from '@/components/Artenvielfalt/InputSheet';
import OsemSheet from '@/components/Artenvielfalt/OsemSheet';
import LineChart from '@/components/LineChart';
import Map from '@/components/Map';
import Tabs, { Tab } from '@/components/Tabs';
import BarChart from '@/components/BarChart';

const generateData = (range: number) => {
  return Array.from({ length: 10 }, (_, i) => {
    return Math.floor(Math.random() * range) + 1;
  });
};

const generateDataOld = (range: number) => {
  return Array.from({ length: 10 }, (_, i) => {
    return Math.floor(Math.random() * range) + 1;
  });
};

const series = [
  {
    name: 'Temperatur',
    data: generateData(50),
  },
  {
    name: 'pflanzliche Artenvielfalt',
    data: generateData(100),
  },
];

const tabs: Tab[] = [
  {
    title: 'Artenvielfalt',
    component: <InputSheet />,
  },
  {
    title: 'Temperatur',
    component: <OsemSheet series={series} />,
    hypothesis:
      'Eine hohe Temperatur hängt zusammen mit einer geringen pflanzlichen Artenvielfalt.',
  },
  {
    title: 'Bodenfeuchte',
    component: <OsemSheet series={series} />,
    hypothesis:
      'Eine hohe Bodenfeuchte hängt zusammen mit einer hohen pflanzlichen Artenvielfalt.',
  },
  {
    title: 'Versiegelung',
    component: <OsemSheet series={series} />,
  },
];

const Artenvielfalt = () => {
  const { schule, gruppe } = useExpeditionParams();

  const yaxis: ApexYAxis[] = [
    {
      seriesName: 'Temperatur',
      showAlways: true,
      title: {
        text: 'Temperatur in °C',
      },
    },
    {
      seriesName: 'plflanzliche Artenvielfalt',
      showAlways: true,
      opposite: true,
      title: {
        text: 'Artenvielfaltsindex',
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
          <Tabs tabs={tabs}></Tabs>
        </div>
        <div className="flex-none md:w-1/3 p-4">
          <div className="rounded-xl overflow-hidden shadow mb-4">
            <Map width="100%" height={200} />
          </div>
          <h2 className="text-xl">Auswertung</h2>
          <BarChart series={series} yaxis={yaxis}></BarChart>
        </div>
      </div>
    </div>
  );
};

export default Artenvielfalt;
