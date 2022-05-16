import React, { useEffect, useState } from 'react';

import { useExpeditionParams } from '@/hooks/useExpeditionParams';
import Map from '@/components/Map';
import Tabs, { Tab } from '@/components/Tabs';
import BarChart from '@/components/BarChart';
import { useTailwindColors } from '@/hooks/useTailwindColors';
import prisma from '@/lib/prisma';
import { FeatureCollection, Point } from 'geojson';
import { GetServerSideProps } from 'next';
import { useOsemData2 } from '@/hooks/useOsemData2';
import { getGroups } from '@/lib/groups';

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  const group = query.gruppe as string;
  const school = query.schule as string;

  const groups = getGroups(group);

  const devices = await fetch(
    `${process.env.NEXT_PUBLIC_OSEM_API}/boxes?format=geojson&grouptag=HU Explorers,Artenvielfalt,${school}`,
  ).then(async response => {
    return await response.json();
  });

  let filteredDevices;

  if (groups.includes(group.toLocaleLowerCase())) {
    filteredDevices = devices.features.filter(device =>
      groups.includes(device.properties.name.toLocaleLowerCase()),
    );
  }

  const featureCollection: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features: filteredDevices,
  };

  const orFilter = filteredDevices.map(device => {
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

  // const dataVersiegelung = versiegelung.map(entry => entry.value);
  // const dataArtenvielfalt = artenvielfalt.map(entry => entry.simpsonIndex);
  const dataArtenvielfalt = filteredDevices.map(device => {
    const vers = artenvielfalt.filter(
      entry =>
        entry.group.toLowerCase() === device.properties.name.toLowerCase(),
    );
    if (vers.length > 0) {
      return vers[0].simpsonIndex;
    }

    return 0;
  });

  const dataVersiegelung = filteredDevices.map(device => {
    const vers = versiegelung.filter(
      entry =>
        entry.group.toLowerCase() === device.properties.name.toLowerCase(),
    );
    if (vers.length > 0) {
      return vers[0].value;
    }

    return 0;
  });

  return {
    props: {
      groups: groups,
      devices: featureCollection,
      versiegelung: dataVersiegelung,
      artenvielfalt: dataArtenvielfalt,
    },
  };
};

type Props = {
  groups: string[];
  devices: any;
  versiegelung: number[];
  artenvielfalt: number[];
};

const Artenvielfalt = ({
  groups,
  devices,
  versiegelung,
  artenvielfalt,
}: Props) => {
  const { schule } = useExpeditionParams();
  const [tab, setTab] = useState(0);
  const [series, setSeries] = useState<any[]>();
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
      groups.includes(e.box.properties.name.toLocaleLowerCase()),
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

    setSeries([
      {
        name: 'Lufttemperatur',
        data: transformedTemperatureData,
      },
      {
        name: 'pflanzliche Artenvielfalt',
        data: artenvielfalt,
      },
    ]);
  }, [data, groups, artenvielfalt]);

  const tabs: Tab[] = [
    {
      id: 'Lufttemperatur',
      title: 'Lufttemperatur',
      hypothesis:
        'Eine hohe Temperatur hängt zusammen mit einer geringen pflanzlichen Artenvielfalt.',
    },
    {
      id: 'Bodenfeuchte',
      title: 'Bodenfeuchte',
      hypothesis:
        'Eine hohe Bodenfeuchte hängt zusammen mit einer hohen pflanzlichen Artenvielfalt.',
    },
    {
      id: 'Undurchlaessigkeit',
      title: 'Versiegelungsanteil',
      hypothesis:
        'Eine hohe Bodenfeuchte hängt zusammen mit einer hohen pflanzlichen Artenvielfalt.',
    },
  ];

  const [xaxis, setXaxis] = useState({
    categories: groups,
    labels: {
      style: {
        fontSize: '16px',
      },
    },
  });

  const [yaxis, setYaxis] = useState<ApexYAxis[]>([
    {
      seriesName: 'Temperatur',
      showAlways: true,
      title: {
        text: 'Temperatur in °C',
        style: {
          fontSize: '16px',
          color: colors.he.lufttemperatur.DEFAULT,
        },
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
                fontSize: '16px',
                color: colors.he.lufttemperatur.DEFAULT,
              },
            },
            axisBorder: {
              show: true,
              color: colors.he.lufttemperatur.DEFAULT,
            },
          },
          {
            seriesName: 'plflanzliche Artenvielfalt',
            showAlways: true,
            max: 1.0,
            title: {
              text: 'Artenvielfaltsindex',
              style: {
                fontSize: '16px',
                color: colors.he.artenvielfalt.DEFAULT,
              },
            },
            opposite: true,
            axisBorder: {
              show: true,
              color: colors.he.artenvielfalt.DEFAULT,
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
                fontSize: '16px',
                color: colors.he.bodenfeuchte.DEFAULT,
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
                fontSize: '16px',
                color: colors.he.artenvielfalt.DEFAULT,
              },
            },
            opposite: true,
            axisBorder: {
              show: true,
              color: colors.he.artenvielfalt.DEFAULT,
            },
          },
        ]);
        break;
      case 2:
        setSeries([
          {
            name: 'Versiegelungsanteil',
            data: versiegelung,
          },
          {
            name: 'pflanzliche Artenvielfalt',
            data: artenvielfalt,
          },
        ]);
        setYaxis([
          {
            seriesName: 'Versiegelungsanteil',
            showAlways: true,
            title: {
              text: 'Versieglungsanteil in %',
              style: {
                fontSize: '16px',
                color: colors.he.undurchlaessigkeit.DEFAULT,
              },
            },
            axisBorder: {
              show: true,
              color: colors.he.undurchlaessigkeit.DEFAULT,
            },
          },
          {
            seriesName: 'plflanzliche Artenvielfalt',
            showAlways: true,
            max: 1.0,
            title: {
              text: 'Artenvielfaltsindex',
              style: {
                fontSize: '16px',
                color: colors.he.artenvielfalt.DEFAULT,
              },
            },
            opposite: true,
            axisBorder: {
              show: true,
              color: colors.he.artenvielfalt.DEFAULT,
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
      <div className="flex h-full w-full flex-row overflow-hidden">
        <div className="flex w-full flex-col">
          <div className="mb-4 h-[25%] max-h-[25%] w-full flex-auto">
            <Map
              width="100%"
              height="100%"
              data={devices}
              expedition={true}
              color
            />
          </div>
          <div className="mr-2 flex flex-col flex-wrap overflow-hidden">
            <Tabs tabs={tabs} onChange={onChange} showHypothesis={true}></Tabs>
          </div>
          <div className="mb-4 w-full flex-auto">
            {series && (
              <BarChart
                series={series}
                yaxis={yaxis}
                xaxis={xaxis}
                colors={[
                  colors.he[tabs[tab].id.toLowerCase()].DEFAULT,
                  colors.he.artenvielfalt.DEFAULT,
                ]}
              ></BarChart>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Artenvielfalt;
