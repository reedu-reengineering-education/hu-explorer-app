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
import LineChart from '@/components/LineChart';

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

const Group = ({ groups, devices, versiegelung, artenvielfalt }: Props) => {
  const { schule } = useExpeditionParams();
  const [tab, setTab] = useState(0);

  const [barChart, setBarChart] = useState<boolean>(true);

  const [lineSeries, setLineSeries] = useState([]);
  const [lineSeriesBodenfeuchte, setLineSeriesBodenfeuchte] = useState([]);
  const [lineSeriesTemperature, setLineSeriesTemperature] = useState([]);
  const [series, setSeries] = useState<any[]>();
  const [temperatureSeries, setTemperatureSeries] = useState<any[]>();
  const [bodenfeuchteSeries, setBodenfeuchteSeries] = useState<any[]>();

  // Fetch openSenseMap data
  const { data, boxes } = useOsemData2('Artenvielfalt', schule, true);
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

    // If no data is available create default entry
    // so that customTools are rendered
    // https://github.com/apexcharts/apexcharts.js/issues/299
    const tempSeries = filteredDevices.map(e => ({
      name: e.box.properties.name,
      data:
        e.temperature.length > 0
          ? e.temperature.map(m => ({
              y: Number(m.value),
              x: new Date(m.createdAt),
            }))
          : [
              {
                y: null,
                x: new Date(),
              },
            ],
    }));
    setLineSeriesTemperature(tempSeries);
    setLineSeries(tempSeries);

    // If no data is available create default entry
    // so that customTools are rendered
    // https://github.com/apexcharts/apexcharts.js/issues/299
    setLineSeriesBodenfeuchte(
      filteredDevices.map(e => ({
        name: e.box.properties.name,
        data:
          e.bodenfeuchte.length > 0
            ? e.bodenfeuchte.map(m => ({
                y: Number(m.value),
                x: new Date(m.createdAt),
              }))
            : [
                {
                  y: null,
                  x: new Date(),
                },
              ],
      })),
    );

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
        setLineSeries(lineSeriesTemperature);
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
        setLineSeries(lineSeriesBodenfeuchte);
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

  const switchChart = () => {
    setBarChart(!barChart);
  };

  return (
    <>
      <div className="flex h-full w-full flex-row overflow-hidden">
        <div className="flex w-full flex-col">
          <div className="mb-4 h-[25%] max-h-[25%] w-full flex-auto">
            <Map data={devices} expedition={true} color />
          </div>
          <div className="mr-2 flex flex-col flex-wrap overflow-hidden">
            <Tabs tabs={tabs} onChange={onChange}></Tabs>
          </div>
          <div className="mb-4 w-full flex-auto pt-10">
            {lineSeries && !barChart && (
              <LineChart
                series={lineSeries}
                yaxis={yaxis}
                customTools={[
                  {
                    title: 'Balkendiagramm',
                    class: 'custom-icon',
                    index: 0,
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
</svg>`,
                    click: switchChart,
                  },
                ]}
              />
            )}
            {series && barChart && (
              <BarChart
                series={series}
                yaxis={yaxis}
                xaxis={xaxis}
                colors={[colors.he[tabs[tab].id.toLowerCase()].DEFAULT]}
                customTools={[
                  {
                    title: 'Liniendiagramm',
                    class: 'custom-icon',
                    index: 0,
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
</svg>`,
                    click: switchChart,
                  },
                ]}
              ></BarChart>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Group;
