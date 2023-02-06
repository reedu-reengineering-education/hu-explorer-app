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
import { defaultBarChartOptions, defaultChartOptions } from '@/lib/charts';
import MeasurementTile, { ChartType } from '../MeasurementTile';
import { ArtenvielfaltRecord, VersiegelungRecord } from '@prisma/client';
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

  const [isBarChartOpen, setIsBarChartOpen] = useState<boolean>(true);
  const [isLineChartOpen, setIsLineChartOpen] = useState<boolean>(false);

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

  // Fetcher for Artenvielfalt
  const { data: versiegelung, error: versiegelungError } = useSWR<
    VersiegelungRecord[]
  >(`/api/versiegelung?project=${tag}`);
  const { data: artenvielfalt, error: artenvielfaltError } = useSWR<
    ArtenvielfaltRecord[]
  >(`/api/artenvielfalt?project=${tag}`);

  const [barChartOptions, setBarChartOptions] = useState<Highcharts.Options>(
    defaultBarChartOptions,
  );
  const [lineChartOptions, setLineChartOptions] =
    useState<Highcharts.Options>(defaultChartOptions);

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
      // setIsBarChartOpen(false);
      setBarChartOptions(defaultBarChartOptions);
      setLineChartOptions(defaultChartOptions);
      setSensor(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box]);

  const openCharts = (chartType: ChartType, device: Feature<Point, Device>) => {
    console.info(`Open ${chartType} Chart: `, device);
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

  const openLineChart = (data: {
    box: Feature<Point, Device>;
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
            id: `${data.box.properties._id}`,
            name: `${data.box.properties.name}`,
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
          colors['he'][data.box.properties.name.toLowerCase()].DEFAULT,
        ],
      });
    } else {
      // Handle open chart
      const serie = lineChartOptions.series.find(serie =>
        serie.id.includes(data.box.properties._id),
      );

      if (serie) {
        // Remove serie from lineChartOptions
        const newSeries = lineChartOptions.series.filter(
          serie => !serie.id.includes(data.box.properties._id),
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
              id: `${data.box.properties._id}`,
              name: `${data.box.properties.name}`,
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
            colors['he'][data.box.properties.name.toLowerCase()].DEFAULT,
          ],
        });
      }
    }

    setReflowCharts(true);
  };

  const getArtenvielfaltTile = (artenvielfalt?: ArtenvielfaltRecord[]) => {
    const sensor: Sensor = {
      title: 'Simpson-Index',
      unit: '',
      sensorType: '',
      ...(artenvielfalt !== undefined &&
      artenvielfalt['_avg'] !== undefined &&
      artenvielfalt['_avg'].simpsonIndex !== null
        ? {
            lastMeasurement: {
              value: artenvielfalt['_avg'].simpsonIndex.toFixed(2),
              createdAt: new Date(),
            },
          }
        : {}),
    };
    return (
      <MeasurementTile
        sensor={sensor}
        openChart={() => console.log('Coming soon')}
        charts={[ChartType.column, ChartType.pie]}
      />
    );
  };

  const getVersiegelungTile = (versiegelung?: VersiegelungRecord[]) => {
    const sensor: Sensor = {
      title: 'Versiegelung',
      unit: '%',
      sensorType: '',
      ...(versiegelung !== undefined &&
      versiegelung['_avg'] !== undefined &&
      versiegelung['_avg'].value !== null
        ? {
            lastMeasurement: {
              value: versiegelung['_avg'].value.toFixed(2),
              createdAt: new Date(),
            },
          }
        : {}),
    };
    return (
      <MeasurementTile
        sensor={sensor}
        openChart={() => console.log('Coming soon')}
        charts={[ChartType.column]}
      />
    );
  };

  return (
    <div className="flex h-full w-full overflow-hidden rounded-lg bg-white p-2 shadow">
      {layout === LayoutMode.MAP ? (
        <div className="flex h-full w-full divide-x-2 overflow-hidden">
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
                            charts={[ChartType.line]}
                            openChart={openCharts}
                          />
                        );
                      } else if (expedition === 'Artenvielfalt' && e.sensor) {
                        return (
                          <MeasurementTile
                            key={i}
                            sensor={e.sensor ?? e.sensor}
                            openChart={() =>
                              console.log('New feature. Coming soon.')
                            }
                            charts={[ChartType.column, ChartType.pie]}
                          />
                        );
                      }
                    })}
                    {expedition === 'Artenvielfalt' ? (
                      <>
                        {getArtenvielfaltTile(artenvielfalt)}
                        {getVersiegelungTile(versiegelung)}
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

            {box !== undefined && !isBarChartOpen && (
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
                          charts={[ChartType.line]}
                          openChart={openCharts}
                        />
                      );
                    } else if (expedition === 'Artenvielfalt') {
                      return (
                        <MeasurementTile
                          key={i}
                          sensor={e.sensor ?? e.sensor}
                          openChart={() =>
                            console.log('New feature. Coming soon.')
                          }
                          charts={[ChartType.column, ChartType.pie]}
                        />
                      );
                    }
                  })}
                  {expedition === 'Artenvielfalt' ? (
                    <>
                      {getArtenvielfaltTile()}
                      {getVersiegelungTile()}
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

                {box !== undefined && !isBarChartOpen && (
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

export default Schulstandort;
