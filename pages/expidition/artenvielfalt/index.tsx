import React, { useEffect, useState } from 'react';

import { useExpeditionParams } from '@/hooks/useExpeditionParams';
import InputSheet from '@/components/Artenvielfalt/InputSheet';
import OsemSheet from '@/components/Artenvielfalt/OsemSheet';
import Map from '@/components/Map';
import Tabs, { Tab } from '@/components/Tabs';
import BarChart from '@/components/BarChart';
import { useTailwindColors } from '@/hooks/useTailwindColors';
import prisma from '@/lib/prisma';
import { FeatureCollection, Point } from 'geojson';
import { GetServerSideProps } from 'next';
import { useOsemData2 } from '@/hooks/useOsemData2';

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

const versiegelungCells = [
  [
    {
      value: 'Undurchlässigkeit',
      readOnly: true,
      className: 'font-bold text-md',
    },
    { value: '' },
  ],
  [
    {
      value: 'Undurchlässigkeit in %',
      readOnly: true,
    },
    { value: 0 },
  ],
  [{ value: '', readOnly: true }],
];
const artenvielfaltCells = [
  [
    {
      value: 'Artenvielfalt',
      readOnly: true,
      className: 'font-bold text-md',
    },
    { value: '' },
  ],
  [
    {
      value: 'Art',
      readOnly: true,
    },
    { value: 'Anzahl', readOnly: true },
  ],
  [
    {
      value: '',
    },
    { value: '' },
  ],
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

  const orFilter = filteredDevices.map(device => {
    console.log(device);

    return {
      deviceId: device.properties._id,
    };
  });

  const versiegelung = await prisma.versiegelungRecord.findMany({
    where: {
      OR: orFilter,
      createdAt: new Date(),
    },
    orderBy: {
      group: 'asc',
    },
  });

  const artenvielfalt = await prisma.artenvielfaltRecord.findMany({
    where: {
      OR: orFilter,
      createdAt: new Date(),
    },
    orderBy: {
      group: 'asc',
    },
  });

  const dataVersiegelung = versiegelung.map(entry => entry.value);
  const dataArtenvielfalt = artenvielfalt.map(entry => entry.simpsonIndex);

  return {
    props: {
      devices: featureCollection,
      versiegelung: dataVersiegelung,
      artenvielfalt: dataArtenvielfalt,
    },
  };
};

type Props = {
  devices: any;
  versiegelung: number[];
  artenvielfalt: number[];
};

const Artenvielfalt = ({ devices, versiegelung, artenvielfalt }: Props) => {
  const { schule, gruppe } = useExpeditionParams();
  const [tab, setTab] = useState(0);
  const [series, setSeries] = useState([]);
  const [temperatureSeries, setTemperatureSeries] = useState({
    name: 'Lufttemperatur',
    data: [],
  });
  const [bodenfeuchteSeries, setBodenfeuchteSeries] = useState({
    name: 'Bodenfeuchte',
    data: [],
  });

  const colors = useTailwindColors();

  // Fetch openSenseMap data
  const { data, boxes } = useOsemData2('Artenvielfalt', schule, false);

  useEffect(() => {
    const filteredDevices = data.filter(e =>
      groups1.includes(e.box.properties.name.toLocaleLowerCase()),
    );

    const transformedTemperatureData = filteredDevices.map(e => {
      const sumWithInitial = e.temperature?.reduce(
        (a, b) => a + (parseFloat(b['value']) || 0),
        0,
      );
      return (sumWithInitial / e.temperature?.length).toFixed(2);
    });

    const transformedBodenfeuchteData = filteredDevices.map(e => {
      const sumWithInitial = e.bodenfeuchte?.reduce(
        (a, b) => a + (parseFloat(b['value']) || 0),
        0,
      );
      return (sumWithInitial / e.bodenfeuchte?.length).toFixed(2);
    });

    setTemperatureSeries({
      name: 'Lufttemperatur',
      data: transformedTemperatureData,
    });

    setBodenfeuchteSeries({
      name: 'Bodenfeuchte',
      data: transformedBodenfeuchteData,
    });
  }, [data]);

  const tabs: Tab[] = [
    {
      id: 'Lufttemperatur',
      title: 'Lufttemperatur',
      component: (
        <OsemSheet
          series={[
            {
              name: 'Lufttemperatur in °C',
              data: temperatureSeries.data,
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
              data: bodenfeuchteSeries.data,
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
        setSeries([
          temperatureSeries,
          {
            name: 'pflanzliche Artenvielfalt',
            data: artenvielfalt,
          },
        ]);
        setYaxis([
          {
            seriesName: 'Lufttemperatur',
            showAlways: true,
            title: {
              text: 'Lufttemperatur in °C',
              style: {
                color: '#56bfc6',
              },
            },
            axisBorder: {
              show: true,
              color: '#56bfc6',
            },
          },
          {
            seriesName: 'plflanzliche Artenvielfalt',
            showAlways: true,
            max: 1.0,
            title: {
              text: 'Artenvielfaltsindex',
              style: {
                color: '#6bbe98',
              },
            },
            opposite: true,
            labels: {
              formatter: function (value) {
                return value.toFixed(2);
              },
            },
            axisBorder: {
              show: true,
              color: '#6bbe98',
            },
          },
        ]);
        break;
      case 1:
        setSeries([
          bodenfeuchteSeries,
          {
            name: 'pflanzliche Artenvielfalt',
            data: artenvielfalt,
          },
        ]);
        setYaxis([
          {
            seriesName: 'Bodenfeuchte',
            showAlways: true,
            title: {
              text: 'Bodenfeuchte in %',
              style: {
                color: '#7d8bc5',
              },
            },
            axisBorder: {
              show: true,
              color: '#7d8bc5',
            },
          },
          {
            seriesName: 'plflanzliche Artenvielfalt',
            showAlways: true,
            max: 1.0,
            title: {
              text: 'Artenvielfaltsindex',
              style: {
                color: '#6bbe98',
              },
            },
            opposite: true,
            labels: {
              formatter: function (value) {
                return value.toFixed(2);
              },
            },
            axisBorder: {
              show: true,
              color: '#6bbe98',
            },
          },
        ]);
        break;
      case 2:
        setSeries([
          {
            name: 'Undurchlässigkeit',
            data: versiegelung,
          },
          {
            name: 'pflanzliche Artenvielfalt',
            data: artenvielfalt,
          },
        ]);
        setYaxis([
          {
            seriesName: 'Undurchlässigkeit',
            showAlways: true,
            title: {
              text: 'Undurchlässigkeit in %',
              style: {
                color: '#004c90',
              },
            },
            axisBorder: {
              show: true,
              color: '#004c90',
            },
          },
          {
            seriesName: 'plflanzliche Artenvielfalt',
            showAlways: true,
            max: 1.0,
            title: {
              text: 'Artenvielfaltsindex',
              style: {
                color: '#6bbe98',
              },
            },
            opposite: true,
            labels: {
              formatter: function (value) {
                return value.toFixed(2);
              },
            },
            axisBorder: {
              show: true,
              color: '#6bbe98',
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
      max: 1.0,
      title: {
        text: 'Artenvielfaltsindex',
      },
      labels: {
        formatter: function (value) {
          return value.toFixed(2);
        },
      },
    },
  ];

  return (
    <>
      <div className="flex flex-row h-full w-full overflow-hidden">
        <div className="flex flex-col w-full">
          <div className="flex-auto w-full h-[25%] max-h-[25%] mb-4">
            <Map width="100%" height="100%" />
          </div>
          <div className="flex flex-col flex-wrap overflow-hidden mr-2">
            <Tabs tabs={tabs} onChange={onChange} showHypothesis={true}></Tabs>
          </div>
          <div className="flex-auto w-full mb-4">
            <BarChart
              series={series}
              yaxis={yaxis}
              xaxis={xaxis}
              colors={[
                colors.he[tabs[tab].id.toLowerCase()].DEFAULT,
                colors.he.artenvielfalt.DEFAULT,
              ]}
            ></BarChart>
          </div>
        </div>
      </div>
    </>
  );
};

export default Artenvielfalt;
