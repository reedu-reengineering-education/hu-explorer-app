import React, { useEffect, useState } from 'react';

import { useExpeditionParams } from '@/hooks/useExpeditionParams';
import Map from '@/components/Map';
import Tabs, { Tab } from '@/components/Tabs';
import { useTailwindColors } from '@/hooks/useTailwindColors';
import { GetServerSideProps } from 'next';
import { FeatureCollection, Point } from 'geojson';
import prisma from '@/lib/prisma';
import { useOsemData2 } from '@/hooks/useOsemData2';
import { getGroups } from '@/lib/groups';
// import LineChart from '@/components/LineChart';
import {
  ArtenvielfaltIcon,
  BodenfeuchteIcon,
  LufttemperaturIcon,
  VersiegelungIcon,
} from '@/components/Artenvielfalt/Icons';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

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
  const [series, setSeries] = useState();
  const [transformedTemperatur, setTransformedTemperatur] = useState<number[]>(
    [],
  );
  const [transformedBodenfeuchte, setTransformedBodenfeuchte] = useState<
    number[]
  >([]);

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
      if (e.temperature.length) {
        return parseFloat((sumWithInitial / e.temperature.length).toFixed(2));
      }
      return null;
    });

    const transformedBodenfeuchteData = filteredDevices.map(e => {
      const sumWithInitial = e.bodenfeuchte?.reduce(
        (a, b) => a + (parseFloat(b['value']) || 0),
        0,
      );
      if (e.bodenfeuchte.length) {
        return parseFloat((sumWithInitial / e.bodenfeuchte.length).toFixed(2));
      }
      return null;
    });

    // If no data is available create default entry
    // so that customTools are rendered
    // https://github.com/apexcharts/apexcharts.js/issues/299
    // const tempSeries = filteredDevices.map(e => ({
    //   name: e.box.properties.name,
    //   data:
    //     e.temperature.length > 0
    //       ? e.temperature.map(m => ({
    //           y: Number(m.value),
    //           x: new Date(m.createdAt),
    //         }))
    //       : [
    //           {
    //             y: 0,
    //             x: new Date(),
    //           },
    //         ],
    // }));
    // setLineSeriesTemperature(tempSeries);
    // setLineSeries(tempSeries);

    // If no data is available create default entry
    // so that customTools are rendered
    // https://github.com/apexcharts/apexcharts.js/issues/299
    // setLineSeriesBodenfeuchte(
    //   filteredDevices.map(e => ({
    //     name: e.box.properties.name,
    //     data:
    //       e.bodenfeuchte.length > 0
    //         ? e.bodenfeuchte.map(m => ({
    //             y: Number(m.value),
    //             x: new Date(m.createdAt),
    //           }))
    //         : [
    //             {
    //               y: 0,
    //               x: new Date(),
    //             },
    //           ],
    //   })),
    // );

    setTransformedTemperatur(transformedTemperatureData);
    setTransformedBodenfeuchte(transformedBodenfeuchteData);

    setBarChartOptions({
      ...barChartOptions,
      yAxis: {
        title: {
          text: 'Lufttemperatur in °C',
          style: {
            fontSize: '16px',
          },
        },
        max: 50,
      },
      series: [
        {
          name: 'Lufttemperatur',
          type: 'column',
          data: transformedTemperatureData.map(v => v),
        },
      ],
      colors: [colors.he.lufttemperatur.DEFAULT],
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, groups]);

  const tabs: Tab[] = [
    {
      id: 'Lufttemperatur',
      title: 'Lufttemperatur',
      icon: <LufttemperaturIcon />,
      hypothesis:
        'Eine hohe Temperatur hängt zusammen mit einer geringen pflanzlichen Artenvielfalt.',
    },
    {
      id: 'Bodenfeuchte',
      title: 'Bodenfeuchte',
      icon: <BodenfeuchteIcon />,
      hypothesis:
        'Eine hohe Bodenfeuchte hängt zusammen mit einer hohen pflanzlichen Artenvielfalt.',
    },
    {
      id: 'Undurchlaessigkeit',
      title: 'Versiegelungsanteil',
      icon: <VersiegelungIcon />,
      hypothesis:
        'Eine hohe Bodenfeuchte hängt zusammen mit einer hohen pflanzlichen Artenvielfalt.',
    },
    {
      id: 'Artenvielfalt',
      title: 'Artenvielfalt',
      icon: <ArtenvielfaltIcon />,
    },
  ];

  const [barChartOptions, setBarChartOptions] = useState<Highcharts.Options>({
    chart: {
      type: 'column',
    },
    title: {
      text: '',
    },
    xAxis: {
      categories: groups,
      crosshair: true,
    },
    legend: {
      enabled: false,
    },
    yAxis: {
      title: {
        text: '',
      },
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
      },
    },
  });

  const onChange = (tab: number) => {
    setTab(tab);
    switch (tab) {
      case 0:
        setBarChartOptions({
          ...barChartOptions,
          yAxis: {
            title: {
              text: 'Lufttemperatur in °C',
              style: {
                fontSize: '16px',
              },
            },
            max: 50,
          },
          series: [
            {
              name: 'Lufttemperatur',
              type: 'column',
              data: transformedTemperatur.map(v => v),
            },
          ],
          colors: [colors.he.lufttemperatur.DEFAULT],
        });
        break;
      case 1:
        setBarChartOptions({
          ...barChartOptions,
          yAxis: {
            title: {
              text: 'Bodenfeuchte in %',
            },
            min: 0,
            max: 50,
          },
          series: [
            {
              name: 'Bodenfeuchte',
              type: 'column',
              data: transformedBodenfeuchte.map(v => v),
            },
          ],
          colors: [colors.he.bodenfeuchte.DEFAULT],
        });
        break;
      case 2:
        setBarChartOptions({
          ...barChartOptions,
          yAxis: {
            title: {
              text: 'Versiegelungsanteil in %',
            },
            min: 0,
            max: 100,
          },
          series: [
            {
              name: 'Versiegelung',
              type: 'column',
              data: versiegelung.map(v => v),
            },
          ],
          colors: [colors.he.undurchlaessigkeit.DEFAULT],
        });
        break;
      case 3:
        setBarChartOptions({
          ...barChartOptions,
          yAxis: {
            title: {
              text: 'Artenvielfaltsindex',
            },
            min: 0,
            max: 1,
          },
          series: [
            {
              name: 'artenvielfalt',
              type: 'column',
              data: artenvielfalt.map(v => v),
            },
          ],
          colors: [colors.he.artenvielfalt.DEFAULT],
        });
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
            <Map width="100%" height="100%" data={devices} expedition={true} />
          </div>
          <Tabs tabs={tabs} onChange={onChange}></Tabs>
          <div className="mb-4 w-full flex-auto pt-10">
            {/* {lineSeries && !barChart && (
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
            )} */}
            {barChart && (
              <HighchartsReact
                containerProps={{ style: { height: '100%' } }}
                highcharts={Highcharts}
                options={barChartOptions}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Group;
