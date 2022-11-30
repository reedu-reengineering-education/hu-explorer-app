import React, { useEffect, useRef, useState } from 'react';
import { Feature, Point } from 'geojson';
import { useTailwindColors } from '@/hooks/useTailwindColors';
import { Sensor } from '@/types/osem';
import useSharedCompareSensors from '@/hooks/useCompareSensors';
import { LayoutMode } from '@/pages';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import BrokenAxis from 'highcharts/modules/broken-axis';
import { useOsemData } from '@/hooks/useOsemData';
import LayoutTile from '../LayoutTile';
import Tile from '../Tile';
import { schallColors } from '@/pages/expidition/schall';
import { defaultBarChartOptions, defaultChartOptions } from '@/lib/charts';

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

  const [sensor, setSensor] = useState<Sensor>();

  const [compareDevice, setCompareDevice] = useState<Feature<Point>>();

  const { data, boxes } = useOsemData(expedition, tag, false);

  const [barChartOptions, setBarChartOptions] = useState<Highcharts.Options>(
    defaultBarChartOptions,
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

    setIsBarChartOpen(!isBarChartOpen);
    setReflowCharts(!reflowCharts);
  }, [data]);

  /**
   * Clean up everything if box / device is changed
   */
  useEffect(() => {
    return () => {
      // Cleanup everything before a new device is selected!!!
      setIsBarChartOpen(false);
      setBarChartOptions(defaultBarChartOptions);
      setSensor(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box]);

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
                <div>
                  <div className="flex h-full flex-row flex-wrap items-center justify-evenly">
                    {data?.map((e, i) => {
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
                          color={{
                            bg: `bg-he-${e.box.properties.name.toLowerCase()}`,
                          }}
                        ></Tile>
                      );
                    })}
                  </div>
                </div>
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
                <div className="flex h-full flex-wrap items-center justify-evenly">
                  {data?.map((e, i) => (
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
                        schallColors[e.box.properties.name.toLocaleLowerCase()]
                      }
                    ></Tile>
                  ))}
                </div>
              </div>
              <div className="mt-2 flex h-full w-full flex-col">
                {!box && (
                  <div className="flex h-full w-full items-center justify-center">
                    <h1 className="text-md content-center text-center font-bold">
                      Wählt per Klick auf die Karte einen Schulstandort aus und
                      ihr seht Messwerte von Umweltfaktoren an dieser Schule.
                    </h1>
                  </div>
                )}

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
