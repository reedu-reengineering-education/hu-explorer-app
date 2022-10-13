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
import {
  ArtenvielfaltIcon,
  BodenfeuchteIcon,
  LufttemperaturIcon,
  VersiegelungIcon,
} from '@/components/Artenvielfalt/Icons';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Button } from '@/components/Elements/Button';
import {
  PresentationChartBarIcon,
  PresentationChartLineIcon,
} from '@heroicons/react/solid';

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
    const tempSeries = filteredDevices.map(e => ({
      name: e.box.properties.name,
      type: 'line',
      data:
        e.temperature.length > 0
          ? e.temperature.map(m => [
              new Date(m.createdAt).getTime(),
              Number(m.value),
            ])
          : [],
    }));
    setLineSeriesTemperature(tempSeries);
    // setLineSeries(tempSeries);

    // If no data is available create default entry
    setLineSeriesBodenfeuchte(
      filteredDevices.map(e => ({
        name: e.box.properties.name,
        data:
          e.bodenfeuchte.length > 0
            ? e.bodenfeuchte.map(m => ({
                y: Number(m.value),
                x: new Date(m.createdAt),
              }))
            : [],
      })),
    );

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

  const [lineChartOptions, setLineChartOptions] = useState<Highcharts.Options>({
    title: {
      text: '',
    },
    chart: {
      zooming: {
        type: 'x',
      },
    },
    plotOptions: {
      series: {
        marker: {
          enabled: false,
          symbol: 'circle',
        },
        lineWidth: 4,
      },
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: {
        millisecond: '%H:%M:%S.%L',
        second: '%H:%M:%S',
        minute: '%H:%M',
        hour: '%H:%M',
        day: '%e. %b',
        week: '%e. %b',
        month: "%b '%y",
        year: '%Y',
      },
    },
    yAxis: {
      title: {
        text: 'Lautstärke in dB',
      },
    },
    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
    },
    colors: [
      colors.he.blue.DEFAULT,
      colors.he.yellow.DEFAULT,
      colors.he.green.DEFAULT,
      colors.he.violet.DEFAULT,
      colors.he.red.DEFAULT,
    ],
    credits: {
      enabled: true,
    },
    time: {
      useUTC: false,
      timezoneOffset: new Date().getTimezoneOffset(),
    },
    tooltip: {
      dateTimeLabelFormats: {
        day: '%d.%m.%Y %H:%M:%S',
      },
    },
  });

  const onChange = (tab: number) => {
    setTab(tab);
    setBarChart(true);
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
    switch (tab) {
      case 0:
        setLineChartOptions({
          ...lineChartOptions,
          yAxis: {
            title: {
              text: 'Lufttemperatur in °C',
              style: {
                fontSize: '16px',
              },
            },
          },
          series: lineSeriesTemperature,
        });
        break;
      case 1:
        setLineChartOptions({
          ...lineChartOptions,
          yAxis: {
            title: {
              text: 'Bodenfeuchte in %',
              style: {
                fontSize: '16px',
              },
            },
          },
          series: lineSeriesBodenfeuchte,
        });
      default:
        break;
    }
    setBarChart(!barChart);
  };

  return (
    <>
      <div className="flex h-full w-full flex-row overflow-hidden">
        <div className="flex w-full flex-col">
          <div className="mb-4 h-[25%] max-h-[25%] w-full flex-auto">
            <Map width="100%" height="100%" data={devices} expedition={true} />
          </div>
          <div className="mb-4">
            <Tabs tabs={tabs} onChange={onChange}></Tabs>
          </div>
          <div className="mb-4 w-full flex-auto">
            <div className="flex flex-row-reverse">
              <Button
                size="sm"
                variant="inverse"
                startIcon={<PresentationChartLineIcon className="h-5 w-5" />}
                disabled={!barChart || tab === 2 || tab === 3}
                onClick={switchChart}
              >
                Liniendiagramm
              </Button>
              <Button
                size="sm"
                variant="inverse"
                startIcon={<PresentationChartBarIcon className="h-5 w-5" />}
                disabled={barChart}
                onClick={switchChart}
              >
                Balkendiagramm
              </Button>
            </div>
            {!barChart && (
              <HighchartsReact
                containerProps={{ style: { height: '100%' } }}
                highcharts={Highcharts}
                options={lineChartOptions}
              />
            )}
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
