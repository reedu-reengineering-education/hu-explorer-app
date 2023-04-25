import React, { useEffect, useState } from 'react';

import { useExpeditionParams } from '@/hooks/useExpeditionParams';
import Map from '@/components/Map';
import Tabs, { Tab } from '@/components/Tabs';
import { useTailwindColors } from '@/hooks/useTailwindColors';
import prisma from '@/lib/prisma';
import { FeatureCollection, Point } from 'geojson';
import { GetServerSideProps } from 'next';
import { useOsemData2 } from '@/hooks/useOsemData2';
import { getGroups } from '@/lib/groups';
import {
  BodenfeuchteIcon,
  LufttemperaturIcon,
  VersiegelungIcon,
} from '@/components/Artenvielfalt/Icons';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {
  transformBodenfeuchteData,
  transformTemperatureData,
} from '@/lib/utils';
import { generateChartOptions } from '@/lib/charts';
import ToggleSwitch from '@/components/ToggleSwitch';

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

  const colors = useTailwindColors();

  // Fetch openSenseMap data
  const { data, boxes } = useOsemData2('Artenvielfalt', schule, false);

  const [transformedTemperatur, setTransformedTemperatur] = useState<number[]>(
    [],
  );
  const [transformedBodenfeuchte, setTransformedBodenfeuchte] = useState<
    number[]
  >([]);

  const [chartOptions, setChartOptions] = useState<Highcharts.Options>({
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
    yAxis: [
      {
        title: {
          text: '',
        },
      },
      {
        title: {
          text: 'Artenvielfaltsindex',
          style: {
            color: colors.he.artenvielfalt.DEFAULT,
          },
        },
        opposite: true,
      },
    ],
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
      },
    },
  });

  useEffect(() => {
    const filteredDevices = data.filter(e =>
      groups.includes(e.box.properties.name.toLocaleLowerCase()),
    );

    const transformedTemperatureData =
      transformTemperatureData(filteredDevices);
    const transformedBodenfeuchteData =
      transformBodenfeuchteData(filteredDevices);

    setTransformedTemperatur(transformedTemperatureData);
    setTransformedBodenfeuchte(transformedBodenfeuchteData);

    // Initially set series
    const chartOptions = generateChartOptions(
      'column',
      {
        text: 'Lufttemperatur in °C',
        value: 'lufttemperatur',
      },
      groups,
      [
        {
          name: 'Lufttemperatur',
          type: 'column',
          data: transformedTemperatureData.map(v => v),
        },
        {
          name: 'Artenvielfalt',
          type: 'column',
          yAxis: 1,
          data: artenvielfalt,
        },
      ],
    );
    setChartOptions(chartOptions);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, groups, artenvielfalt]);

  const tabs: Tab[] = [
    {
      id: 'Lufttemperatur',
      title: 'Lufttemperatur',
      icon: <LufttemperaturIcon />,
    },
    {
      id: 'Bodenfeuchte',
      title: 'Bodenfeuchte',
      icon: <BodenfeuchteIcon />,
    },
    {
      id: 'Undurchlaessigkeit',
      title: 'Versiegelungsanteil',
      icon: <VersiegelungIcon />,
    },
  ];

  const onChange = (tab: number, percent?: boolean) => {
    let chartOptionsTmp;
    setTab(tab);

    let artenvielfaltData = artenvielfalt.slice();
    if (percent) {
      artenvielfaltData = artenvielfaltData.map(v => v * 100);
    }

    switch (tab) {
      case 0:
        chartOptionsTmp = generateChartOptions(
          'column',
          {
            text: 'Lufttemperatur in °C',
            value: 'lufttemperatur',
          },
          groups,
          [
            {
              name: 'Bodenfeuchte',
              type: 'column',
              data: transformedTemperatur.map(v => v),
            },
            {
              name: percent ? 'Artenvielfalt in %' : 'Artenvielfalt',
              type: 'column',
              yAxis: 1,
              data: percent ? artenvielfaltData : artenvielfalt,
            },
          ],
          percent,
        );
        break;
      case 1:
        chartOptionsTmp = generateChartOptions(
          'column',
          {
            text: 'Bodenfeuchte in %',
            value: 'bodenfeuchte',
          },
          groups,
          [
            {
              name: 'Bodenfeuchte',
              type: 'column',
              data: transformedBodenfeuchte.map(v => v),
            },
            {
              name: percent ? 'Artenvielfalt in %' : 'Artenvielfalt',
              type: 'column',
              yAxis: 1,
              data: percent ? artenvielfaltData : artenvielfalt,
            },
          ],
          percent,
        );
        break;
      case 2:
        chartOptionsTmp = generateChartOptions(
          'column',
          {
            text: 'Versiegelungsanteil in %',
            value: 'undurchlaessigkeit',
          },
          groups,
          [
            {
              name: 'Versiegelung',
              type: 'column',
              data: versiegelung.map(v => v),
            },
            {
              name: percent ? 'Artenvielfalt in %' : 'Artenvielfalt',
              type: 'column',
              yAxis: 1,
              data: percent ? artenvielfaltData : artenvielfalt,
            },
          ],
          percent,
        );
        break;
      default:
        break;
    }
    setChartOptions(chartOptionsTmp);
  };

  const updateChartAxis = (value: boolean) => {
    if (value) {
      // generate Chart options with % axis
      onChange(tab, value);
    } else {
      // reset Chart options
      onChange(tab, value);
    }
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
            <div className="mr-2 flex flex-row-reverse">
              <ToggleSwitch onChange={updateChartAxis} />
            </div>
            <HighchartsReact
              containerProps={{ style: { height: '100%' } }}
              highcharts={Highcharts}
              options={chartOptions}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Artenvielfalt;
