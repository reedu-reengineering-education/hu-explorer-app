import React, { useEffect, useRef, useState } from 'react';
import { Feature, Point } from 'geojson';
import { useTailwindColors } from '@/hooks/useTailwindColors';
import { Device, Sensor } from '@/types/osem';
import useSharedCompareSensors from '@/hooks/useCompareSensors';
import { LayoutMode } from '@/pages';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import BrokenAxis from 'highcharts/modules/broken-axis';
import { useOsemData } from '@/hooks/useOsemData';
import Tile from '../Tile';
import { schallColors } from '@/pages/expidition/schall';
import {
  defaultBarChartOptions,
  defaultChartOptions,
  defaultPieChartOptions,
} from '@/lib/charts';
import MeasurementTile, { ChartType } from '../MeasurementTile';
import {
  ArtRecord,
  ArtenvielfaltRecord,
  VersiegelungRecord,
} from '@prisma/client';
import useSWR from 'swr';

if (typeof Highcharts === 'object') {
  BrokenAxis(Highcharts);
}

const CHART_SERIES_GAP_SIZE: number =
  Number(process.env.NEXT_PUBLIC_CHART_SERIES_GAP_SIZE) || 180000;

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

const Schulstandort = ({
  box,
  tag,
  expedition,
  rendering,
  dateRange,
  layout,
}: {
  box: Feature<Point>;
  tag: string;
  expedition: string;
  rendering: string;
  dateRange: Date[];
  layout: LayoutMode;
}) => {
  console.info(
    'Opening Schulstandort view: ',
    box,
    tag,
    expedition,
    rendering,
    dateRange,
    layout,
  );
  const colors = useTailwindColors();
  const { compareSensors } = useSharedCompareSensors();

  useEffect(() => {
    if (compareSensors.length > 0) {
      const { active, sensor, device } = compareSensors[0];
      // updateSeries(active, device, sensor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compareSensors]);

  const lineChart = useRef(null);
  const pieChart = useRef(null);
  const barChart = useRef(null);

  const [isBarChartOpen, setIsBarChartOpen] = useState<boolean>(false);
  const [isLineChartOpen, setIsLineChartOpen] = useState<boolean>(false);
  const [isPieChartOpen, setIsPieChartOpen] = useState<boolean>(false);

  const [sensor, setSensor] = useState<Sensor>();

  const [compareDevice, setCompareDevice] = useState<Feature<Point>>();

  const { data, boxes } = useOsemData(
    expedition,
    tag,
    false,
    dateRange[0],
    dateRange[1],
  );
  console.log('useOsemData: ', data, boxes, colors);

  // TODO: only fetch for Artenvielfalt expedition
  // Fetcher for Artenvielfalt
  const { data: versiegelung, error: versiegelungError } = useSWR<{
    aggregations: VersiegelungRecord[];
    lastMeasurement: VersiegelungRecord;
    measurements: VersiegelungRecord[];
    grouped: VersiegelungRecord[];
  }>(`/api/versiegelung?project=${tag}`);
  console.log('API Versieglung: ', versiegelung);
  const { data: artenvielfalt, error: artenvielfaltError } = useSWR<{
    aggregations: ArtenvielfaltRecord[];
    lastMeasurement: ArtenvielfaltRecord;
    measurements: ArtenvielfaltRecord[];
    grouped: ArtenvielfaltRecord[];
  }>(`/api/artenvielfalt?project=${tag}`);

  const [barChartOptions, setBarChartOptions] = useState<Highcharts.Options>(
    defaultBarChartOptions,
  );
  const [lineChartOptions, setLineChartOptions] =
    useState<Highcharts.Options>(defaultChartOptions);
  const [pieChartOptions, setPieChartOptions] = useState<Highcharts.Options>(
    defaultPieChartOptions,
  );

  const [reflowCharts, setReflowCharts] = useState(false);

  useEffect(() => {
    if (reflowCharts) {
      lineChart.current?.chart.reflow();
      pieChart.current?.chart.reflow();
      barChart.current?.chart.reflow();
    }

    return () => {
      setReflowCharts(false);
    };
  }, [reflowCharts]);

  useEffect(() => {
    if (data.length === 0) {
      return;
    }

    if (expedition === 'Artenvielfalt') {
      return;
    }

    setBarChartOptions({
      ...barChartOptions,
      colors: [
        colors['he']['eingang'].DEFAULT,
        colors['he']['straße'].DEFAULT,
        colors['he']['hof'].DEFAULT,
        colors['he']['klingel'].DEFAULT,
        colors['he']['flur'].DEFAULT,
      ],
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
    setIsBarChartOpen(true);

    setReflowCharts(r => !r);
  }, [data]);

  // useEffect(() => {
  //   if (dateRange[0] === null || dateRange[1] === null) {
  //     console.log("Date range resettet")
  //     return
  //   }

  //   console.info("DateRange was selected and set!")

  //   return () => {}
  // }, [dateRange])

  /**
   * Clean up everything if box / device is changed
   */
  useEffect(() => {
    return () => {
      // Cleanup everything before a new device is selected!!!
      setIsLineChartOpen(false);
      setIsBarChartOpen(false);
      setBarChartOptions(defaultBarChartOptions);
      setLineChartOptions(defaultChartOptions);
      setSensor(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box]);

  // Tile Component
  const openCharts = (chartType: ChartType, device: Feature<Point, Device>) => {
    // console.info(`Open ${chartType} Chart: `, device);
    const osemData = data.filter(
      feature => feature.box.properties._id === device.properties._id,
    );

    switch (chartType) {
      case ChartType.column:
        // openBarChart(sensorParam);
        return;
      case ChartType.pie:
        // openPieChart(sensorParam);
        return;
      case ChartType.line:
        openLineChart(osemData[0]);
        return;
      default:
        break;
    }
  };

  // MeasurementTile Component
  const openChartSensor = (chartType: ChartType, sensor: Sensor) => {
    console.info(`Open ${chartType} Chart for sensor: `, sensor);
    const osemData = data.filter(
      feature => feature.sensor.title === sensor.title,
    );

    switch (chartType) {
      case ChartType.column:
        openBarChart(sensor);
        return;
      case ChartType.pie:
        openPieChart(sensor);
        return;
      case ChartType.line:
        openLineChart(osemData[0]);
        return;
      default:
        break;
    }
  };

  const openLineChart = (data: {
    box: Feature<Point, Device>; // Box is set on Schallpegel
    sensor?: Sensor; // Sensor is set on Artenvielfalt
    measurements: any[];
  }) => {
    if (!isLineChartOpen) {
      setIsLineChartOpen(!isLineChartOpen);

      setLineChartOptions({
        ...lineChartOptions,
        yAxis: {
          title: {
            text: 'Lautstärke in dB',
          },
        },
        series: [
          {
            id: `${
              data.box?.properties._id || data.sensor.title.toLowerCase()
            }`,
            name: `${data.box?.properties.name || data.sensor.title}`,
            type: 'line',
            gapUnit: 'value',
            gapSize: CHART_SERIES_GAP_SIZE,
            data: data.measurements
              .map(m => [new Date(m.createdAt).getTime(), Number(m.value)])
              .reverse(),
          },
        ],
        colors: [
          ...lineChartOptions.colors,
          colors['he'][
            data.box?.properties.name.toLowerCase() ||
              data.sensor.title.toLowerCase()
          ].DEFAULT,
        ],
      });
    } else {
      // Handle open chart
      const serie = lineChartOptions.series.find(serie =>
        serie.id.includes(
          data.box?.properties._id || data.sensor.title.toLowerCase(),
        ),
      );

      if (serie) {
        // Remove serie from lineChartOptions
        const newSeries = lineChartOptions.series.filter(
          serie =>
            !serie.id.includes(
              data.box?.properties._id || data.sensor.title.toLowerCase(),
            ),
        );

        // Keep chartOptions up to date
        setLineChartOptions({
          ...lineChartOptions,
          series: newSeries,
          // colors: [], TODO: filter and remove color
          // yAxis: [] TODO: filter and remove yAxis
        });

        // If no series data existing, close chart and clean up
        if (newSeries.length === 0) {
          setIsLineChartOpen(false);
          setLineChartOptions(defaultChartOptions);
        }
      } else {
        // Add additional serie to line chart
        setLineChartOptions({
          ...lineChartOptions,
          series: [
            ...lineChartOptions.series,
            {
              id: `${
                data.box?.properties._id || data.sensor.title.toLowerCase()
              }`,
              name: `${data.box?.properties.name || data.sensor.title}`,
              type: 'line',
              gapUnit: 'value',
              gapSize: CHART_SERIES_GAP_SIZE,
              data: data.measurements
                .map(m => [new Date(m.createdAt).getTime(), Number(m.value)])
                .reverse(),
            },
          ],
          colors: [
            ...lineChartOptions.colors,
            colors['he'][
              data.box?.properties.name.toLowerCase() ||
                data.sensor.title.toLowerCase()
            ].DEFAULT,
          ],
        });
      }
    }

    setReflowCharts(true);
  };

  const openBarChart = (sensor: Sensor) => {
    const serie = sensor.title.toLowerCase().startsWith('simpson')
      ? 'artenvielfalt'
      : 'versiegelung';
    let seriesData = [];
    let seriesCategories = [];

    sensor.groups.forEach(g => {
      seriesData.push(Number(g.value));
      seriesCategories.push(new Date(g.createdAt).toISOString().split('T')[0]);
    });

    setBarChartOptions({
      ...barChartOptions,
      yAxis: {
        title: {
          text: `${serie} in %`,
        },
      },
      xAxis: {
        categories: seriesCategories,
      },
      series: [
        {
          id: `${serie}-${sensor._id}`,
          name: serie,
          type: 'column',
          data: seriesData,
        },
      ],
      colors: [colors['he'][serie].DEFAULT],
    });

    setIsBarChartOpen(!isBarChartOpen);
    setReflowCharts(!reflowCharts);
  };

  const openPieChart = (sensor: Sensor) => {
    const seriesData = [];

    for (const art of sensor.measurements[0]['arten'] as Array<ArtRecord>) {
      seriesData.push({
        name: art.art,
        y: art.count,
      });
    }

    setPieChartOptions({
      ...pieChartOptions,
      title: {
        text: 'Artenvielfalt',
      },
      series: [
        ...pieChartOptions.series,
        {
          name: 'Artenvielfalt',
          type: 'pie',
          // colorByPoint: true,
          data: seriesData,
        },
      ],
    });

    setIsPieChartOpen(!isPieChartOpen);
    setReflowCharts(!reflowCharts);
  };

  const getArtenvielfaltTile = ({
    aggregations,
    measurements,
    grouped,
  }: {
    aggregations: ArtenvielfaltRecord[];
    lastMeasurement: ArtenvielfaltRecord;
    measurements: ArtenvielfaltRecord[];
    grouped: ArtenvielfaltRecord[];
  }) => {
    const sensor: Sensor = {
      title: 'Simpson-Index',
      unit: '',
      sensorType: '',
      ...(aggregations !== undefined &&
      aggregations['_avg'] !== undefined &&
      aggregations['_avg'].simpsonIndex !== null
        ? {
            lastMeasurement: {
              value: aggregations['_avg'].simpsonIndex.toFixed(2),
              createdAt: measurements[0].updatedAt,
            },
          }
        : {}),
      measurements,
      groups: grouped.map(group => ({
        value: group['_avg'].simpsonIndex.toFixed(2),
        createdAt: group.createdAt,
      })),
    };
    return (
      <MeasurementTile
        sensor={sensor}
        openChart={openChartSensor}
        charts={[ChartType.column, ChartType.pie]}
      />
    );
  };

  const getVersiegelungTile = ({
    aggregations,
    measurements,
    grouped,
  }: {
    aggregations: VersiegelungRecord[];
    lastMeasurement: VersiegelungRecord;
    measurements: VersiegelungRecord[];
    grouped: VersiegelungRecord[];
  }) => {
    const sensor: Sensor = {
      title: 'Versiegelung',
      unit: '%',
      sensorType: '',
      ...(aggregations !== undefined &&
      aggregations['_avg'] !== undefined &&
      aggregations['_avg'].value !== null
        ? {
            lastMeasurement: {
              value: aggregations['_avg'].value.toFixed(2),
              createdAt: measurements[0].updatedAt,
            },
          }
        : {}),
      measurements,
      groups: grouped.map(group => ({
        value: group['_avg'].value.toFixed(2),
        createdAt: group.createdAt,
      })),
    };
    return (
      <MeasurementTile
        sensor={sensor}
        openChart={openChartSensor}
        charts={[ChartType.column]}
      />
    );
  };

  return (
    <div className="flex h-full w-full overflow-hidden rounded-lg bg-white p-2 shadow">
      {layout === LayoutMode.MAP ? (
        // Map Layout
        <div className="flex h-full w-full divide-x-2 overflow-hidden">
          {box && (
            // Metadata and tile rendering area
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
              {/* Graph rendering area */}
              <div className="flex h-full flex-wrap justify-center overflow-auto align-middle">
                <div>
                  <div className="flex h-full flex-row flex-wrap items-center justify-evenly">
                    {data?.map((e, i) => {
                      if (expedition === 'Schallpegel' && e.box) {
                        return (
                          <Tile
                            key={i}
                            title={e.box.properties.name}
                            min={
                              e.measurements.length > 0
                                ? Math.min(
                                    ...e.measurements.map(m => Number(m.value)),
                                  )
                                : undefined
                            }
                            max={
                              e.measurements.length > 0
                                ? Math.max(
                                    ...e.measurements.map(m => Number(m.value)),
                                  )
                                : undefined
                            }
                            color={
                              schallColors[
                                e.box.properties.name.toLocaleLowerCase()
                              ]
                            }
                            device={e.box}
                            measurements={e.measurements}
                            charts={[ChartType.line]}
                            openChart={openCharts}
                          />
                        );
                      } else if (expedition === 'Artenvielfalt' && e.sensor) {
                        return (
                          <MeasurementTile
                            key={i}
                            sensor={e.sensor ?? e.sensor}
                            value={
                              e.measurements.reduce(
                                (acc, cur) => acc + Number(cur.value),
                                0,
                              ) / e.measurements.length
                            }
                            openChart={openChartSensor}
                            charts={[ChartType.line]}
                          />
                        );
                      }
                    })}
                    {/* Render Artenvielfalt specific tiles */}
                    {expedition === 'Artenvielfalt' ? (
                      <>
                        {artenvielfalt && getArtenvielfaltTile(artenvielfalt)}
                        {versiegelung && getVersiegelungTile(versiegelung)}
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="ml-2 flex w-[70%] min-w-[70%]">
            {isBarChartOpen && (
              <div className="flex w-full overflow-hidden">
                <div className="m-2 h-[95%] min-h-0 w-full overflow-hidden">
                  <HighchartsReact
                    ref={barChart}
                    containerProps={{ style: { height: '100%' } }}
                    highcharts={Highcharts}
                    allowChartUpdate={true}
                    options={barChartOptions}
                  />
                </div>
              </div>
            )}

            {isPieChartOpen && (
              <div className="m-2 h-[95%] w-full overflow-hidden">
                <HighchartsReact
                  ref={pieChart}
                  containerProps={{ style: { height: '100%' } }}
                  highcharts={Highcharts}
                  allowChartUpdate={true}
                  options={pieChartOptions}
                />
              </div>
            )}

            {isLineChartOpen && (
              <div className="flex w-full overflow-hidden">
                <div className="m-2 h-[95%] min-h-0 w-full overflow-hidden">
                  <HighchartsReact
                    ref={lineChart}
                    containerProps={{ style: { height: '100%' } }}
                    highcharts={Highcharts}
                    allowChartUpdate={true}
                    options={lineChartOptions}
                  />
                </div>
              </div>
            )}

            {!isBarChartOpen && !isLineChartOpen && !isPieChartOpen ? (
              <div className="flex h-full w-full items-center justify-center text-center">
                <h1>
                  Klicke auf eine Kachel um dir die Daten in einem Graphen
                  anzuzeigen.
                </h1>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        // Full screen layout
        <div className="flex h-full w-full overflow-hidden">
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
                <div className="flex h-full flex-wrap items-center justify-evenly">
                  {data?.map((e, i) => {
                    if (expedition === 'Schallpegel') {
                      return (
                        <Tile
                          key={i}
                          title={e.box.properties.name}
                          min={
                            e.measurements.length > 0
                              ? Math.min(
                                  ...e.measurements.map(m => Number(m.value)),
                                )
                              : undefined
                          }
                          max={
                            e.measurements.length > 0
                              ? Math.max(
                                  ...e.measurements.map(m => Number(m.value)),
                                )
                              : undefined
                          }
                          color={
                            schallColors[
                              e.box.properties.name.toLocaleLowerCase()
                            ]
                          }
                          device={e.box}
                          measurements={e.measurements}
                          charts={[ChartType.line]}
                          openChart={openCharts}
                        />
                      );
                    } else if (expedition === 'Artenvielfalt') {
                      return (
                        <MeasurementTile
                          key={i}
                          sensor={e.sensor ?? e.sensor}
                          value={
                            e.measurements.reduce(
                              (acc, cur) => acc + Number(cur.value),
                              0,
                            ) / e.measurements.length
                          }
                          openChart={openChartSensor}
                          charts={[ChartType.line]}
                        />
                      );
                    }
                  })}
                  {expedition === 'Artenvielfalt' ? (
                    <>
                      {artenvielfalt && getArtenvielfaltTile(artenvielfalt)}
                      {versiegelung && getVersiegelungTile(versiegelung)}
                    </>
                  ) : null}
                </div>
              </div>
              <div className="mt-2 flex h-full w-full flex-col">
                {isBarChartOpen && (
                  <div className="flex h-full w-full overflow-hidden">
                    <div className="m-2 h-[95%] min-h-0 w-full overflow-hidden">
                      <HighchartsReact
                        ref={barChart}
                        containerProps={{ style: { height: '100%' } }}
                        highcharts={Highcharts}
                        allowChartUpdates={true}
                        options={barChartOptions}
                      />
                    </div>
                  </div>
                )}

                {isPieChartOpen && (
                  <div className="m-2 h-[95%] w-full overflow-hidden">
                    <HighchartsReact
                      ref={pieChart}
                      containerProps={{ style: { height: '100%' } }}
                      highcharts={Highcharts}
                      allowChartUpdate={true}
                      options={pieChartOptions}
                    />
                  </div>
                )}

                {isLineChartOpen && (
                  <div className="flex h-full w-full overflow-hidden">
                    <div className="m-2 h-[95%] min-h-0 w-full overflow-hidden">
                      <HighchartsReact
                        ref={lineChart}
                        containerProps={{ style: { height: '100%' } }}
                        highcharts={Highcharts}
                        allowChartUpdate={true}
                        options={lineChartOptions}
                      />
                    </div>
                  </div>
                )}

                {!isBarChartOpen && !isLineChartOpen && !isPieChartOpen ? (
                  <div className="flex h-full w-full items-center justify-center text-center">
                    <h1>
                      Klicke auf eine Kachel um dir die Daten in einem Graphen
                      anzuzeigen.
                    </h1>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Schulstandort;
