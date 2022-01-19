import React, { useEffect, useState } from 'react';

import { useExpeditionParams } from '@/hooks/useExpeditionParams';
import InputSheet from '@/components/Artenvielfalt/InputSheet';
import OsemSheet from '@/components/Artenvielfalt/OsemSheet';
import Map from '@/components/Map';
import Tabs, { Tab } from '@/components/Tabs';
import BarChart from '@/components/BarChart';
import { useTailwindColors } from '@/hooks/useTailwindColors';

const groups1 = ['gruppe 1', 'gruppe 2', 'gruppe 3', 'gruppe 4', 'gruppe 5'];

const groups2 = ['gruppe 6', 'gruppe 7', 'gruppe 8', 'gruppe 9', 'gruppe 10'];

const generateData = (range: number, length: number) => {
  return Array.from({ length: length }, (_, i) => {
    return Math.floor(Math.random() * range) + 1;
  });
};

const temperatureData = [
  {
    name: 'Temperatur in °C',
    data: generateData(50, 5),
  },
];

const versiegelungData = [
  {
    name: 'Versiegelung',
    data: generateData(100, 5),
  },
];

const bodenfeuchteData = [
  {
    name: 'Bodenfeuchte in %',
    data: generateData(100, 5),
  },
];

const versiegelungCells = [
  [
    { value: 'Versiegelung', readOnly: true, className: 'font-bold text-md' },
    { value: '' },
  ],
  [
    {
      value: 'Versiegelungsgrad in %',
      readOnly: true,
    },
    { value: 0 },
  ],
  [{ value: '', readOnly: true }],
];

const Group = () => {
  const { schule, gruppe } = useExpeditionParams();
  const [tab, setTab] = useState(0);
  const [series, setSeries] = useState(temperatureData);

  const colors = useTailwindColors();

  const tabs: Tab[] = [
    {
      title: 'Temperatur',
      component: (
        <OsemSheet
          series={[
            {
              name: 'Temperatur in °C',
              data: generateData(50, 20),
            },
          ]}
        />
      ),
      hypothesis:
        'Eine hohe Temperatur hängt zusammen mit einer geringen pflanzlichen Artenvielfalt.',
    },
    {
      title: 'Bodenfeuchte',
      component: (
        <OsemSheet
          series={[
            {
              name: 'Bodenfeuchte in %',
              data: generateData(100, 20),
            },
          ]}
        />
      ),
      hypothesis:
        'Eine hohe Bodenfeuchte hängt zusammen mit einer hohen pflanzlichen Artenvielfalt.',
    },
    {
      title: 'Versiegelung',
      component: <InputSheet cells={versiegelungCells} />,
      hypothesis:
        'Eine hohe Bodenfeuchte hängt zusammen mit einer hohen pflanzlichen Artenvielfalt.',
    },
  ];

  const [xaxis, setXaxis] = useState({
    categories: groups1,
  });

  useEffect(() => {
    if (groups2.includes(gruppe as string)) {
      setXaxis({
        categories: groups2,
      });
    }
  }, [gruppe]);

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
    setTab(tab);
    switch (tab) {
      case 0:
        setSeries(temperatureData);
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
        setSeries(bodenfeuchteData);
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
        setSeries(versiegelungData);
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

  return (
    <>
      <div className="flex flex-row h-full w-full overflow-hidden">
        <div className="flex flex-col w-full">
          <div className="flex-auto w-full h-[25%] max-h-[25%] mb-4">
            <Map width="100%" height="100%" />
          </div>
          <div className="flex flex-col flex-wrap overflow-hidden mr-2">
            <Tabs tabs={tabs} onChange={onChange}></Tabs>
          </div>
          <div className="flex-auto w-full mb-4 pt-10">
            <BarChart
              series={series}
              yaxis={yaxis}
              xaxis={xaxis}
              colors={[colors.he[tabs[tab].title.toLowerCase()].DEFAULT]}
            ></BarChart>
          </div>
        </div>
      </div>
    </>
  );
};

export default Group;
