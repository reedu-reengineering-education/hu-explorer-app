import React, { useEffect, useState } from 'react';

import { useExpeditionParams } from '@/hooks/useExpeditionParams';
import Map from '@/components/Map';
import Tabs, { Tab } from '@/components/Tabs';
import BarChart from '@/components/BarChart';
import { useTailwindColors } from '@/hooks/useTailwindColors';
import { GetServerSideProps } from 'next';
import { FeatureCollection, Point } from 'geojson';
import prisma from '@/lib/prisma';
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
  console.log(versiegelung);

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

const Group = ({ groups, devices, versiegelung, artenvielfalt }: Props) => {
  const { schule } = useExpeditionParams();
  const [tab, setTab] = useState(0);

  const [series, setSeries] = useState<any[]>();
  const [temperatureSeries, setTemperatureSeries] = useState<any[]>();
  const [bodenfeuchteSeries, setBodenfeuchteSeries] = useState<any[]>();

  console.log(versiegelung);
  console.log(devices);

  // Fetch openSenseMap data
  const { data, boxes } = useOsemData2('Artenvielfalt', schule, false);
  const colors = useTailwindColors();

  useEffect(() => {
    const filteredDevices = data.filter(e =>
      groups.includes(e.box.properties.name.toLocaleLowerCase()),
    );
    console.log('useEffect');
    console.log(filteredDevices);

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

    setTemperatureSeries([
      {
        name: 'Lufttemperatur',
        data: transformedTemperatureData,
      },
    ]);

    setBodenfeuchteSeries([
      {
        name: 'Lufttemperatur',
        data: transformedBodenfeuchteData,
      },
    ]);

    setSeries([
      {
        name: 'Lufttemperatur',
        data: transformedTemperatureData,
      },
    ]);
  }, [data, groups]);

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
      title: 'Undurchlässigkeit',
      hypothesis:
        'Eine hohe Bodenfeuchte hängt zusammen mit einer hohen pflanzlichen Artenvielfalt.',
    },
    {
      id: 'Artenvielfalt',
      title: 'Artenvielfalt',
    },
  ];

  const [xaxis, setXaxis] = useState({
    categories: groups,
  });

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
        setSeries(temperatureSeries);
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
        setSeries(bodenfeuchteSeries);
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
        setSeries([
          {
            name: 'Versiegelung',
            data: versiegelung,
          },
        ]);
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
        setSeries([
          {
            name: 'Artenvielfalt',
            data: artenvielfalt,
          },
        ]);
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
      <div className="flex h-full w-full flex-row overflow-hidden">
        <div className="flex w-full flex-col">
          <div className="mb-4 h-[25%] max-h-[25%] w-full flex-auto">
            <Map width="100%" height="100%" data={devices} />
          </div>
          <div className="mr-2 flex flex-col flex-wrap overflow-hidden">
            <Tabs tabs={tabs} onChange={onChange}></Tabs>
          </div>
          <div className="mb-4 w-full flex-auto pt-10">
            {series && (
              <BarChart
                series={series}
                yaxis={yaxis}
                xaxis={xaxis}
                colors={[colors.he[tabs[tab].id.toLowerCase()].DEFAULT]}
              ></BarChart>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Group;
