import React, { useEffect, useState } from 'react';
import { Feature, Point } from 'geojson';
import useSWR from 'swr';
import {
  ArtenvielfaltRecord,
  ArtRecord,
  VersiegelungRecord,
} from '@prisma/client';
import { fetcher } from '@/lib/fetcher';
// import PieChart from './PieChart';
import { useTailwindColors } from '@/hooks/useTailwindColors';
import { Sensor } from '@/types/osem';
import MeasurementTile from './MeasurementTile';
import useSharedCompareSensors from '@/hooks/useCompareSensors';
import { LayoutMode } from '@/pages';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import BrokenAxis from 'highcharts/modules/broken-axis';

if (typeof Highcharts === 'object') {
  BrokenAxis(Highcharts);
}

const CHART_SERIES_GAP_SIZE: number =
  Number(process.env.NEXT_PUBLIC_CHART_SERIES_GAP_SIZE) || 180000;

const deafultChartOptions: Highcharts.Options = {
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
  yAxis: [],
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
  legend: {
    align: 'center',
    verticalAlign: 'bottom',
    layout: 'horizontal',
  },
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
  colors: [],
  series: [],
};

const Sidebar = ({
  box,
  dateRange,
  layout,
}: {
  box: Feature<Point>;
  dateRange: Date[];
  layout: LayoutMode;
}) => {
  const colors = useTailwindColors();
  const { compareSensors } = useSharedCompareSensors();

  useEffect(() => {
    if (compareSensors.length > 0) {
      const { active, sensor, device } = compareSensors[0];
      updateSeries(active, device, sensor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compareSensors]);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isPieChartOpen, setIsPieChartOpen] = useState<boolean>(false);
  const [isBarChartOpen, setIsBarChartOpen] = useState<boolean>(false);
  const { data: artenvielfalt, error: artenvielfaltError } = useSWR<
    ArtenvielfaltRecord[]
  >(`/api/artenvielfalt/${box?.properties._id}`);
  const { data: versiegelung, error: versiegelungError } = useSWR<
    VersiegelungRecord[]
  >(`/api/versiegelung/${box?.properties._id}`);
  console.log(versiegelung);

  const [sensor, setSensor] = useState<Sensor>();
  const [shouldFetch, setShouldFetch] = useState(false);
  const { data } = useSWR(
    shouldFetch
      ? `https://api.opensensemap.org/boxes/${box.properties._id}/data/${
          sensor._id
        }?${
          dateRange[0] ? `from-date=${dateRange[0].toISOString()}&` : ''
        }to-date=${
          dateRange[1]
            ? dateRange[1].toISOString()
            : sensor.lastMeasurement.createdAt
        }`
      : null,
    fetcher,
  );

  const [compareDevice, setCompareDevice] = useState<Feature<Point>>();
  const [sensor2, setSensor2] = useState<Sensor>();
  const [shouldFetch2, setShouldFetch2] = useState(false);

  const { data: data2 } = useSWR(
    shouldFetch2
      ? `https://api.opensensemap.org/boxes/${compareDevice?.properties._id}/data/${sensor2._id}?to-date=${sensor2.lastMeasurement.createdAt}`
      : null,
    fetcher,
  );

  const [shouldFetchVersiegelung, setshouldFetchVersiegelung] = useState(false);
  const { data: versiegelung2, error: versiegelung2Error } = useSWR<
    VersiegelungRecord[]
  >(
    shouldFetchVersiegelung
      ? `/api/versiegelung/${compareDevice?.properties._id}`
      : null,
  );
  console.log('Versieglung 2: ', versiegelung2);
  const [shouldFetchArtenvielfalt, setshouldFetchArtenvielfalt] =
    useState(false);
  const { data: artenvielfalt2, error: artenvielfalt2Error } = useSWR<
    VersiegelungRecord[]
  >(
    shouldFetchArtenvielfalt
      ? `/api/artenvielfalt/${compareDevice?.properties._id}`
      : null,
  );
  console.log('Artenvielfalt 2: ', artenvielfalt2);

  // const [yAxis, setYAxis] = useState<ApexYAxis[]>([]);
  // const [yAxisBarChart, setYAxisBarChart] = useState<ApexYAxis[]>();
  const [series, setSeries] = useState([]); // Holding data for chart (Line and Bar)
  const [seriesColors, setSeriesColors] = useState([]); // Holding all colors for series
  // const [pieChartSeries, setPieChartSeries] = useState([]); // Holding data for chart (Pie)
  // const [barChartSeries, setBarChartSeries] = useState([]); // Holding data for chart (Pie)
  // const [pieChartLabels, setPieChartLabels] = useState([]);

  // NEW Basic chart options for Highcharts
  // Maybe we can use it for all chart types
  const [chartOptions, setChartOptions] =
    useState<Highcharts.Options>(deafultChartOptions);

  /**
   * Clean up everything if box / device is changed
   */
  useEffect(() => {
    return () => {
      // Cleanup everything before a new device is selected!!!
      setIsOpen(false);
      setChartOptions(deafultChartOptions);
      setShouldFetch(false);
      setShouldFetch2(false);
      setshouldFetchArtenvielfalt(false);
      setshouldFetchVersiegelung(false);
      setSensor(null);
      setSensor2(null);

      // Old stuff before highcharts
      // setIsBarChartOpen(false);
      // setIsPieChartOpen(false);
      // setSeries([]);
      // setBarChartSeries([]);
      // setPieChartSeries([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box]);

  // Effect to set series data for main selected device
  useEffect(() => {
    if (data) {
      // Check if yAxis already exists
      const axisTitle = sensor.title + ' ' + sensor.unit;
      const axis = (chartOptions.yAxis as Highcharts.YAxisOptions[]).find(
        yAxis => yAxis.title.text === axisTitle,
      );
      let yAxis = [...(chartOptions.yAxis as Highcharts.YAxisOptions[])];
      if (!axis) {
        yAxis.push({
          title: {
            text: sensor.title + ' ' + sensor.unit,
          },
          opposite:
            (chartOptions.yAxis as Highcharts.YAxisOptions[]).length > 0
              ? true
              : false,
        });
      }

      setChartOptions({
        ...chartOptions,
        yAxis: yAxis,
        series: [
          ...chartOptions.series.filter(
            serie => !serie.id.includes(sensor._id),
          ),
          {
            id: `${box.properties._id}-${sensor._id}`,
            name: `${box.properties.name}-${sensor.title}`,
            type: 'line',
            gapUnit: 'value',
            gapSize: CHART_SERIES_GAP_SIZE,
            yAxis: yAxis.length > 0 ? yAxis.length - 1 : 0,
            data: data
              .map(m => [new Date(m.createdAt).getTime(), Number(m.value)])
              .reverse(),
          },
        ],
        colors: [
          ...chartOptions.colors,
          colors['he'][sensor.title.toLowerCase()].DEFAULT,
        ],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    console.log('Chart Options updated:', chartOptions);
  }, [chartOptions]);

  useEffect(() => {
    if (versiegelung2) {
      setSeries([
        ...series.filter(serie => !serie.id.includes(sensor2.title)),
        {
          id: `${compareDevice.properties._id}-${sensor2.title}`,
          name: `${compareDevice.properties.name}-${sensor2.title}`,
          type: 'line',
          data: versiegelung2.map(m => ({
            y: Number(m.value),
            x: new Date(m.createdAt),
          })),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versiegelung2]);

  useEffect(() => {
    if (artenvielfalt2) {
      setSeries([
        ...series.filter(serie => !serie.id.includes(sensor2.title)),
        {
          id: `${compareDevice.properties._id}-${sensor2.title}`,
          name: `${compareDevice.properties.name}-${sensor2.title}`,
          type: 'line',
          data: artenvielfalt2.map(m => ({
            y: Number(m.value),
            x: new Date(m.createdAt),
          })),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artenvielfalt2]);

  // Effect to set series data for devices to compare
  useEffect(() => {
    if (data2) {
      setChartOptions({
        ...chartOptions,
        series: [
          ...chartOptions.series,
          {
            id: `${compareDevice.properties._id}-${sensor2._id}`,
            name: `${compareDevice.properties.name}-${sensor2.title}`,
            type: 'line',
            gapUnit: 'value',
            gapSize: CHART_SERIES_GAP_SIZE,
            data: data2
              .map(m => [new Date(m.createdAt).getTime(), Number(m.value)])
              .reverse(),
          },
        ],
        colors: [
          ...chartOptions.colors,
          colors['he'][sensor2.title.toLowerCase()].DEFAULT,
        ],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data2]);

  const openCharts = (sensorParam: Sensor) => {
    setSensor(sensorParam);
    const sensorColor =
      colors['he'][sensorParam.title.toLocaleLowerCase()].DEFAULT;

    if (!isOpen) {
      setIsOpen(!isOpen);

      if (sensorParam.title.toLowerCase() === 'versiegelung') {
        setChartOptions({
          ...chartOptions,
          yAxis: {
            title: {
              text: 'Versiegelung in %',
            },
          },
          series: [
            ...chartOptions.series,
            {
              id: `versiegelung-${sensorParam._id}`,
              name: 'Versiegelung',
              type: 'line',
              data: versiegelung.map(v => [
                new Date(v.createdAt).getTime(),
                v.value,
              ]),
            },
          ],
          colors: [
            ...chartOptions.colors,
            colors['he'][sensorParam.title.toLocaleLowerCase()].DEFAULT,
          ],
        });
      } else {
        setShouldFetch(!isOpen);
      }
    } else {
      // Handle open chart
      const serie = chartOptions.series.find(serie =>
        serie.id.includes(sensorParam._id),
      );

      if (serie) {
        // Stop fetching data
        setShouldFetch(false);

        const newSeries = chartOptions.series.filter(
          serie => !serie.id.includes(sensorParam._id),
        );

        // TODO: Keep chartOptions up to date
        setChartOptions({
          ...chartOptions,
          series: newSeries,
          // colors: [], TODO: filter and remove color
          // yAxis: [] TODO: filter and remove yAxis
        });

        // If no series data existing, close chart and clean up
        if (newSeries.length === 0) {
          setIsOpen(false);
          setChartOptions(deafultChartOptions);
        }
      } else {
        // Fetch data for selected sensor of main device
        setShouldFetch(true);
      }
    }
  };

  const openPieChart = (sensor: Sensor) => {
    console.log(sensor);
    const series: number[] = [];
    const labels: string[] = [];

    for (const art of artenvielfalt[0]['arten'] as Array<ArtRecord>) {
      series.push(art.count);
      labels.push(art.art);
    }

    // setPieChartLabels(labels);
    // setPieChartSeries(series);

    setIsPieChartOpen(!isPieChartOpen);
  };

  // const openBarChart = (sensor: Sensor) => {
  //   console.log(sensor);

  //   setSeries([
  //     ...series,
  //     {
  //       id: `versiegelung-${sensor._id}`,
  //       name: 'Versiegelung',
  //       type: 'column',
  //       data: versiegelung.map(v => ({
  //         y: Number(v.value),
  //         x: new Date(v.createdAt).toLocaleDateString()
  //       }))
  //     }
  //   ])

  //   setSeriesColors([
  //     ...seriesColors,
  //     colors.he[sensor.title.toLocaleLowerCase()].DEFAULT,
  //   ]);

  //   setYAxis([
  //     ...yAxis,
  //     {
  //       title: {
  //         text: 'Versiegelung in %',
  //       }
  //     },
  //   ])

  //   if (!isOpen) {
  //     setIsOpen(!isOpen);
  //   }
  //   // setIsOpen(!isOpen)

  //   // setIsBarChartOpen(!isBarChartOpen);
  // };

  const updateSeries = (
    enabled: boolean,
    device: Feature<Point>,
    sensor: Sensor,
  ) => {
    if (enabled) {
      setCompareDevice(device);
      setSensor2(sensor);
    } else {
      const seriesIndex = chartOptions.series.findIndex(
        serie => serie.id === `${device.properties._id}-${sensor._id}`,
      );

      setChartOptions({
        ...chartOptions,
        series: chartOptions.series.filter(
          serie => serie.id !== `${device.properties._id}-${sensor._id}`,
        ),
        colors: chartOptions.colors.filter(
          (colors, idx) => idx !== seriesIndex,
        ),
      });
    }

    switch (sensor.title) {
      case 'Artenvielfalt':
        setshouldFetchArtenvielfalt(enabled);
        break;
      case 'Versiegelung':
        setshouldFetchVersiegelung(enabled);
        break;
      default:
        setShouldFetch2(enabled);
        break;
    }
  };

  const getArtenvielfaltTile = (artenvielfalt: ArtenvielfaltRecord[]) => {
    const sensor: Sensor = {
      _id:
        artenvielfalt !== undefined && artenvielfalt[0] !== undefined
          ? artenvielfalt[0].id
          : '',
      title: 'Simpson-Index',
      unit: '',
      sensorType: '',
      ...(artenvielfalt !== undefined && artenvielfalt[0] !== undefined
        ? {
            lastMeasurement: {
              value: artenvielfalt[0].simpsonIndex.toFixed(2),
              createdAt: artenvielfalt[0].updatedAt,
            },
          }
        : {}),
    };
    return (
      <MeasurementTile sensor={sensor} openChart={() => openPieChart(sensor)} />
    );
  };

  const getVersiegelungTile = (versiegelung: VersiegelungRecord[]) => {
    const sensor: Sensor = {
      _id:
        versiegelung !== undefined && versiegelung[0] !== undefined
          ? versiegelung[0].id
          : '',
      title: 'Versiegelung',
      unit: '%',
      sensorType: '',
      ...(versiegelung !== undefined && versiegelung[0] !== undefined
        ? {
            lastMeasurement: {
              value: versiegelung[versiegelung.length - 1].value.toFixed(2),
              createdAt: versiegelung[versiegelung.length - 1].updatedAt,
            },
          }
        : {}),
    };
    return (
      <MeasurementTile sensor={sensor} openChart={() => openCharts(sensor)} />
    );
  };

  return (
    <div className="flex h-full w-full overflow-hidden overflow-y-scroll rounded-lg bg-white p-2 shadow">
      {layout === LayoutMode.MAP ? (
        <div className="flex h-full w-full divide-x-2 overflow-hidden overflow-y-scroll">
          {box && (
            <div className="min-w[30%] max-w[30%] flex w-[30%]  flex-col divide-y-2 overflow-hidden">
              <div className="mb-2">
                <h1 className="mb-2 content-center text-center text-lg font-bold">
                  {box.properties.name}
                </h1>
                <div className="flex justify-center">
                  {box.properties.tags.map((tag, idx) => {
                    // First index is HU Explorers tag
                    if (idx === 0) {
                      return;
                    }
                    return (
                      <span
                        className="mr-2 inline-flex items-center justify-center rounded-full bg-he-violet px-2 py-1 text-xs font-bold leading-none text-white"
                        key={tag}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="flex h-full flex-wrap justify-center overflow-auto align-middle">
                {box.properties.sensors.map(sensor => {
                  return (
                    <MeasurementTile
                      key={sensor._id}
                      sensor={sensor}
                      openChart={openCharts}
                    />
                  );
                })}

                {box.properties.tags.includes('Artenvielfalt') && (
                  <>
                    {getArtenvielfaltTile(artenvielfalt)}
                    {getVersiegelungTile(versiegelung)}
                  </>
                )}
              </div>
            </div>
          )}
          <div className="ml-2 flex w-[70%] min-w-[70%]">
            {!box && (
              <div className="flex h-full w-full items-center justify-center">
                <h1 className="text-md content-center text-center font-bold">
                  Wählt per Klick auf die Karte einen Schulstandort aus und ihr
                  seht Messwerte von Umweltfaktoren an dieser Schule.
                </h1>
              </div>
            )}

            {isOpen && (
              <div className="flex w-full overflow-hidden">
                <div className="m-2 h-[95%] min-h-0 w-full overflow-clip">
                  <HighchartsReact
                    containerProps={{ style: { height: '100%' } }}
                    highcharts={Highcharts}
                    options={chartOptions}
                  />
                </div>
              </div>
            )}

            {isBarChartOpen && (
              <div className="flex w-full overflow-hidden">
                <div className="m-2 h-[95%] min-h-0 w-full overflow-hidden">
                  {/* <BarChart
                    series={barChartSeries}
                    yaxis={yAxisBarChart}
                    colors={[colors.he.undurchlaessigkeit.DEFAULT]}
                  /> */}
                </div>
              </div>
            )}

            {isPieChartOpen && (
              <div className="m-2 h-[95%] w-full overflow-hidden">
                {/* <PieChart series={pieChartSeries} labels={pieChartLabels} /> */}
              </div>
            )}
            {box !== undefined &&
              !isOpen &&
              !isPieChartOpen &&
              !isBarChartOpen && (
                <div className="flex h-full w-full items-center justify-center text-center">
                  <h1>
                    Klicke auf eine Kachel um dir die Daten in einem Graphen
                    anzuzeigen.
                  </h1>
                </div>
              )}
          </div>
        </div>
      ) : (
        <div className="flex h-full w-full overflow-hidden overflow-y-scroll">
          {box && (
            <div className="flex w-full flex-col">
              <div className="mb-2">
                <h1 className="mb-2 content-center text-center text-lg font-bold">
                  {box.properties.name}
                </h1>
                <div className="flex justify-center">
                  {box.properties.tags.map((tag, idx) => {
                    // First index is HU Explorers tag
                    if (idx === 0) {
                      return;
                    }
                    return (
                      <span
                        className="mr-2 inline-flex items-center justify-center rounded-full bg-he-violet px-2 py-1 text-xs font-bold leading-none text-white"
                        key={tag}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-evenly">
                {box.properties.sensors.map(sensor => {
                  return (
                    <MeasurementTile
                      key={sensor._id}
                      sensor={sensor}
                      openChart={openCharts}
                    />
                  );
                })}

                {box.properties.tags.includes('Artenvielfalt') && (
                  <>
                    {getArtenvielfaltTile(artenvielfalt)}
                    {getVersiegelungTile(versiegelung)}
                  </>
                )}
              </div>
              <div className="mt-2 flex h-full w-full">
                {!box && (
                  <div className="flex h-full w-full items-center justify-center">
                    <h1 className="text-md content-center text-center font-bold">
                      Wählt per Klick auf die Karte einen Schulstandort aus und
                      ihr seht Messwerte von Umweltfaktoren an dieser Schule.
                    </h1>
                  </div>
                )}

                {isOpen && (
                  <div className="flex w-full overflow-hidden">
                    <div className="m-2 h-[95%] min-h-0 w-full overflow-clip">
                      {/* <LineChart
                        series={series}
                        yaxis={yAxis}
                        colors={seriesColors}
                      /> */}
                    </div>
                  </div>
                )}

                {isBarChartOpen && (
                  <div className="flex w-full overflow-hidden">
                    <div className="m-2 h-[95%] min-h-0 w-full overflow-hidden">
                      {/* <BarChart
                        series={barChartSeries}
                        yaxis={yAxisBarChart}
                        colors={[colors.he.undurchlaessigkeit.DEFAULT]}
                      /> */}
                    </div>
                  </div>
                )}

                {isPieChartOpen && (
                  <div className="m-2 h-[95%] w-full overflow-hidden">
                    {/* <PieChart series={pieChartSeries} labels={pieChartLabels} /> */}
                  </div>
                )}
                {box !== undefined &&
                  !isOpen &&
                  !isPieChartOpen &&
                  !isBarChartOpen && (
                    <div className="flex h-full w-full items-center justify-center text-center">
                      <h1>
                        Klicke auf eine Kachel um dir die Daten in einem Graphen
                        anzuzeigen.
                      </h1>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
