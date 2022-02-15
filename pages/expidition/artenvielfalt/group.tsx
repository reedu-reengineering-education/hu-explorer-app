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

  const [series, setSeries] = useState([]);
  const [temperatureSeries, setTemperatureSeries] = useState([]);
  const [bodenfeuchteSeries, setBodenfeuchteSeries] = useState([]);

  // Fetch openSenseMap data
  const { data, boxes } = useOsemData2('Artenvielfalt', schule, false);
  const colors = useTailwindColors();

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
