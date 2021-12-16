import React, { useState } from 'react';

import { useExpeditionParams } from '@/hooks/useExpeditionParams';
import InputSheet from '@/components/Artenvielfalt/InputSheet';
import OsemSheet from '@/components/Artenvielfalt/OsemSheet';
import Map from '@/components/Map';
import Tabs, { Tab } from '@/components/Tabs';
import BarChart from '@/components/BarChart';

const generateData = (range: number, length: number) => {
  return Array.from({ length: length }, (_, i) => {
    return Math.floor(Math.random() * range) + 1;
  });
};

const seriesData = [
  {
    name: 'Temperatur in °C',
    data: generateData(50, 5),
  },
];
const series = [
  {
    name: 'Temperatur in °C',
    data: generateData(50, 20),
  },
];

const seriesData4 = [
  {
    name: 'Versiegelung',
    data: generateData(100, 5),
  },
];
const series4 = [
  {
    name: 'Versiegelung in %',
    data: generateData(100, 1),
  },
];

const seriesData2 = [
  {
    name: 'pflanzliche Artenvielfalt',
    data: generateData(100, 20),
  },
];

const series2 = [
  {
    name: 'pflanzliche Artenvielfalt',
    data: generateData(100, 5),
  },
];

const seriesData3 = [
  {
    name: 'Bodenfeuchte in %',
    data: generateData(100, 6),
  },
];

const series3 = [
  {
    name: 'Bodenfeuchte in %',
    data: generateData(100, 20),
  },
];

const tabs: Tab[] = [
  {
    title: 'Temperatur',
    component: <OsemSheet series={series} />,
    hypothesis:
      'Eine hohe Temperatur hängt zusammen mit einer geringen pflanzlichen Artenvielfalt.',
  },
  {
    title: 'Bodenfeuchte',
    component: <OsemSheet series={seriesData3} />,
    hypothesis:
      'Eine hohe Bodenfeuchte hängt zusammen mit einer hohen pflanzlichen Artenvielfalt.',
  },
  {
    title: 'Versiegelung',
    component: <InputSheet />,
    hypothesis:
      'Eine hohe Bodenfeuchte hängt zusammen mit einer hohen pflanzlichen Artenvielfalt.',
  },
  {
    title: 'Artenvielfalt',
    component: <InputSheet />,
  },
];

const Artenvielfalt = () => {
  const { schule, gruppe } = useExpeditionParams();
  const [series, setSeries] = useState(seriesData);
  const [xaxis, setXaxis] = useState({
    categories: [
      'senseBox 1',
      'senseBox 2',
      'senseBox 3',
      'senseBox 4',
      'senseBox 5',
    ],
  });
  const [yaxis, setYaxis] = useState<ApexYAxis[]>([
    {
      seriesName: 'Temperatur',
      showAlways: true,
      title: {
        text: 'Temperatur in °C',
      },
    },
  ]);

  const onChange = (tab: number) => {
    switch (tab) {
      case 0:
        setSeries(seriesData);
        setYaxis([
          {
            seriesName: 'Temperatur',
            showAlways: true,
            title: {
              text: 'Temperatur in °C',
            },
          },
        ]);
        break;
      case 1:
        setSeries(seriesData3);
        setYaxis([
          {
            seriesName: 'Bodenfeuchte',
            showAlways: true,
            title: {
              text: 'Bodenfeuchte in %',
            },
          },
        ]);
        break;
      case 2:
        setSeries(seriesData4);
        setYaxis([
          {
            seriesName: 'Versiegelung',
            showAlways: true,
            title: {
              text: 'Versiegelung in %',
            },
          },
        ]);
        break;
      default:
        break;
    }
  };

  const yaxis2: ApexYAxis[] = [
    {
      seriesName: 'plflanzliche Artenvielfalt',
      showAlways: true,
      title: {
        text: 'Artenvielfaltsindex',
      },
    },
  ];

  return (
    <>
      {/* <div className="flex flex-row">
        <div className="p-4">
          <h1 className="text-4xl">Artenvielfalt</h1>
          <div className="font-semibold text-gray-500">Schule: {schule}</div>
          <div className="font-semibold text-gray-500">Gruppe: {gruppe}</div>
        </div>
      </div> */}
      <div className="flex flex-row h-full w-full overflow-hidden">
        {/* <LayoutTile> */}
        <div className="flex flex-row flex-wrap max-w-[40%] overflow-hidden mr-2">
          <Tabs tabs={tabs} onChange={onChange}></Tabs>
        </div>
        {/* </LayoutTile> */}
        <div className="flex flex-col w-full">
          <div className="flex-auto w-full max-h-[25%]">
            <Map width="100%" height="100%" />
          </div>
          <div className="flex-auto w-full max-h-[37%]">
            <BarChart series={series} yaxis={yaxis} xaxis={xaxis}></BarChart>
          </div>
          <div className="flex-auto w-full max-h-[37%]">
            <BarChart series={series2} yaxis={yaxis2} xaxis={xaxis}></BarChart>
          </div>
        </div>
      </div>
      {/* <div className="flex flex-col sm:flex-row divide-x-2 divide-blue-500 overflow-hidden">
          <div className="flex-grow md:w-2/3 p-4 overflow-hidden">
            <Tabs tabs={tabs}></Tabs>
          </div>
          <div className="flex-none md:w-1/3 p-4 overflow-auto">
            <div className="rounded-xl overflow-hidden shadow mb-4">
              <Map width="100%" height={200} />
            </div>
            <h2 className="text-xl">Auswertung</h2>
            <BarChart series={series} yaxis={yaxis}></BarChart>
          </div>
        </div> */}
    </>
  );
};

export default Artenvielfalt;
