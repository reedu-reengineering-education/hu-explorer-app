import React, { useEffect, useState } from 'react';

import { useExpeditionParams } from '@/hooks/useExpeditionParams';
import InputSheet from '@/components/Artenvielfalt/InputSheet';
import OsemSheet from '@/components/Artenvielfalt/OsemSheet';
import Map from '@/components/Map';
import Tabs, { Tab } from '@/components/Tabs';
import BarChart from '@/components/BarChart';
import { useTailwindColors } from '@/hooks/useTailwindColors';
import { GetServerSideProps } from 'next';
import { FeatureCollection, Point } from 'geojson';

const groups1 = [
  'sensebox1',
  'sensebox2',
  'sensebox3',
  'sensebox4',
  'sensebox5',
];

const groups2 = [
  'sensebox6',
  'sensebox7',
  'sensebox8',
  'sensebox9',
  'sensebox10',
];

const generateData = (range: number, length: number) => {
  return Array.from({ length: length }, (_, i) => {
    return Math.floor(Math.random() * range) + 1;
  });
};

const generateRandomData = (range: number, length: number) => {
  return Array.from({ length: length }, (_, i) => {
    return parseFloat(Math.random().toFixed(2));
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

const artenvielfaltData = [
  {
    name: 'Artenvielfaltsindex',
    data: generateRandomData(1, 5),
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

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  const group = query.gruppe as string;
  const school = query.schule as string;

  const devices = await fetch(
    `${process.env.NEXT_PUBLIC_OSEM_API}/boxes?format=geojson&grouptag=HU Explorers,Artenvielfalt,${school}`,
  ).then(async response => {
    return await response.json();
  });

  let filteredDevices;

  if (groups1.includes(group.toLocaleLowerCase())) {
    filteredDevices = devices.features.filter(device =>
      groups1.includes(device.properties.name.toLocaleLowerCase()),
    );
  } else if (groups2.includes(group.toLocaleLowerCase())) {
    filteredDevices = devices.features.filter(device =>
      groups2.includes(device.properties.name.toLocaleLowerCase()),
    );
  }

  const featureCollection: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features: filteredDevices,
  };

  return {
    props: {
      devices: featureCollection,
    },
  };
};

type Props = {
  devices: any;
};

const Group = ({ devices }: Props) => {
  const { schule, gruppe } = useExpeditionParams();
  const [tab, setTab] = useState(0);
  const [series, setSeries] = useState(temperatureData);

  const colors = useTailwindColors();

  console.log(devices);

  const tabs: Tab[] = [
    {
      id: 'Lufttemperatur',
      title: 'Lufttemperatur',
      component: (
        <OsemSheet
          series={[
            {
              name: 'Lufttemperatur in °C',
              data: generateData(50, 20),
            },
          ]}
        />
      ),
      hypothesis:
        'Eine hohe Temperatur hängt zusammen mit einer geringen pflanzlichen Artenvielfalt.',
    },
    {
      id: 'Bodenfeuchte',
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
      id: 'Undurchlaessigkeit',
      title: 'Undurchlässigkeit',
      component: <InputSheet cells={versiegelungCells} />,
      hypothesis:
        'Eine hohe Bodenfeuchte hängt zusammen mit einer hohen pflanzlichen Artenvielfalt.',
    },
    {
      id: 'Artenvielfalt',
      title: 'Artenvielfalt',
      component: <InputSheet cells={versiegelungCells} />,
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
      seriesName: 'Lufttemperatur',
      showAlways: true,
      title: {
        text: 'Lufttemperatur in °C',
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
            seriesName: 'Lufttemperatur',
            showAlways: true,
            title: {
              text: 'Lufttemperatur in °C',
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
            seriesName: 'Undurchlässigkeit',
            showAlways: true,
            title: {
              text: 'Undurchlässigkeit in %',
            },
          },
        ]);
        break;
      case 3:
        setSeries(artenvielfaltData);
        setYaxis([
          {
            seriesName: 'Artenvielfalt',
            showAlways: true,
            title: {
              text: 'Artenvielfaltsindex',
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
            <Map width="100%" height="100%" data={devices} />
          </div>
          <div className="flex flex-col flex-wrap overflow-hidden mr-2">
            <Tabs tabs={tabs} onChange={onChange}></Tabs>
          </div>
          <div className="flex-auto w-full mb-4 pt-10">
            <BarChart
              series={series}
              yaxis={yaxis}
              xaxis={xaxis}
              colors={[colors.he[tabs[tab].id.toLowerCase()].DEFAULT]}
            ></BarChart>
          </div>
        </div>
      </div>
    </>
  );
};

export default Group;
