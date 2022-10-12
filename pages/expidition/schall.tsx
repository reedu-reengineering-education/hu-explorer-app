import Tile from '@/components/Tile';
import Map from '@/components/Map';
import { useExpeditionParams } from '@/hooks/useExpeditionParams';
import LayoutTile from '@/components/LayoutTile';
import { useEffect, useState } from 'react';
import { useTailwindColors } from '@/hooks/useTailwindColors';
import { useOsemData } from '@/hooks/useOsemData';
import { PauseIcon } from '@heroicons/react/outline';
import { PlayIcon } from '@heroicons/react/solid';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export const schallColors = {
  straße: { bg: 'bg-he-yellow', shadow: 'shadow-he-yellow' },
  eingang: { bg: 'bg-he-blue-light', shadow: 'shadow-he-blue-light' },
  hof: { bg: 'bg-he-green', shadow: 'shadow-he-green' },
  flur: { bg: 'bg-he-red', shadow: 'shadow-he-red' },
  klingel: { bg: 'bg-he-violet', shadow: 'shadow-he-violet' },
};

const Schall = () => {
  const { schule } = useExpeditionParams();

  const [live, setLive] = useState(true);
  const { data, boxes } = useOsemData('Schallpegel', schule, live);

  const colors = useTailwindColors();
  const [chartOptions, setChartOptions] = useState<Highcharts.Options>({
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

  const [barChartOptions, setBarChartOptions] = useState<Highcharts.Options>({
    title: {
      text: '',
    },
    chart: {
      type: 'column',
    },
    xAxis: {
      categories: [
        '0 - 19 dB',
        '20 - 39 dB',
        '40 - 59 dB',
        '60 - 79 dB',
        '80 - 99 dB',
        '100 - 119 dB',
        '120 - 139 dB',
        'über 139 dB',
      ],
      crosshair: true,
    },
    yAxis: {
      title: {
        text: 'Anzahl der Messungen',
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
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
      },
    },
  });

  useEffect(() => {
    setChartOptions({
      series: data.map(e => ({
        name: e.box.properties.name,
        type: 'line',
        data: e.measurements.map(m => [
          new Date(m.createdAt).getTime(),
          Number(m.value),
        ]),
      })),
    });

    setBarChartOptions({
      series: data.map(e => ({
        name: e.box.properties.name,
        type: 'column',
        data: barChartCategories.map(
          c =>
            e.measurements
              .map(m => Number(m.value))
              .filter(x => c[0] <= x && x <= c[1], c).length,
        ),
      })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const barChartCategories = [
    [0, 19],
    [20, 39],
    [40, 59],
    [60, 79],
    [80, 99],
    [100, 119],
    [120, 139],
    [139, 10000],
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="p-4">
        <div className="flex justify-between">
          <h1 className="text-4xl">Schall</h1>
          <>
            {!live && (
              <PlayIcon
                className="h-8 w-8 cursor-pointer transition hover:scale-110"
                onClick={() => setLive(!live)}
              />
            )}
            {live && (
              <PauseIcon
                className="h-8 w-8 cursor-pointer transition hover:scale-110"
                onClick={() => setLive(!live)}
              />
            )}
          </>
        </div>
        <div className="font-semibold text-gray-500">Schule: {schule}</div>
      </div>
      <div className="flex h-full w-full flex-wrap">
        <LayoutTile>
          <div className="flex h-full flex-row flex-wrap items-center justify-evenly">
            {data?.map((e, i) => (
              <Tile
                key={i}
                title={e.box.properties.name}
                min={
                  e.measurements.length > 0
                    ? Math.min(...e.measurements.map(m => Number(m.value)))
                    : undefined
                }
                max={
                  e.measurements.length > 0
                    ? Math.max(...e.measurements.map(m => Number(m.value)))
                    : undefined
                }
                color={schallColors[e.box.properties.name.toLocaleLowerCase()]}
              ></Tile>
            ))}
          </div>
        </LayoutTile>
        <LayoutTile>
          <div className="h-full min-h-[300px] w-full overflow-hidden rounded-xl shadow">
            <Map
              width="100%"
              height="100%"
              data={boxes}
              expedition={true}
              color
              zoomLevel={10}
            />
          </div>
        </LayoutTile>
        <LayoutTile>
          <div className="h-full w-full">
            <HighchartsReact
              containerProps={{ style: { height: '100%' } }}
              highcharts={Highcharts}
              options={barChartOptions}
            />
          </div>
        </LayoutTile>
        <LayoutTile>
          <div className="h-full w-full">
            <HighchartsReact
              containerProps={{ style: { height: '100%' } }}
              highcharts={Highcharts}
              options={chartOptions}
            />
          </div>
        </LayoutTile>
      </div>
    </div>
  );
};

export default Schall;
