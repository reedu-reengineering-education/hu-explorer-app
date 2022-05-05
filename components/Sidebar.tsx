import React, { useEffect, useState } from 'react';
import { Feature, Point } from 'geojson';
import { format } from 'date-fns';
import useSWR from 'swr';
import {
  ArtenvielfaltRecord,
  ArtRecord,
  VersiegelungRecord,
} from '@prisma/client';
import LineChart from './LineChart';
import { fetcher } from '@/lib/fetcher';
import PieChart from './PieChart';
import useSharedCompareMode from '@/hooks/useCompareMode';
import { useTailwindColors } from '@/hooks/useTailwindColors';
import Toggle from './Toggle';
import { Device, Sensor } from '@/types/osem';
import { Button } from './Elements/Button';
import BarChart from './BarChart';

const tileColors = {
  Lufttemperatur: 'bg-he-lufttemperatur',
  Bodenfeuchte: 'bg-he-bodenfeuchte',
  'rel. Luftfeuchte': 'bg-blue-500',
  'PM2.5': 'bg-slate-500',
  PM10: 'bg-stone-500',
  Luftdruck: 'bg-teal-500',
  Beleuchtungsstärke: 'bg-amber-400',
  'UV-Intensität': 'bg-green-400',
};

const Sidebar = ({
  box,
  compareBoxes,
  setCompareBoxes,
}: {
  box: Feature<Point>;
  compareBoxes: Feature<Point>[];
  setCompareBoxes: React.Dispatch<React.SetStateAction<any>>;
}) => {
  const { setCompare } = useSharedCompareMode();
  const colors = useTailwindColors();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isPieChartOpen, setIsPieChartOpen] = useState<boolean>(false);
  const [isBarChartOpen, setIsBarChartOpen] = useState<boolean>(false);
  const { data: artenvielfalt, error: artenvielfaltError } = useSWR<
    ArtenvielfaltRecord[]
  >(`/api/artenvielfalt/${box?.properties._id}`);
  const { data: versiegelung, error: versiegelungError } = useSWR<
    VersiegelungRecord[]
  >(`/api/versiegelung/${box?.properties._id}`);

  const [sensor, setSensor] = useState<Sensor>();
  const [shouldFetch, setShouldFetch] = useState(false);
  const { data } = useSWR(
    shouldFetch
      ? `https://api.opensensemap.org/boxes/${box.properties._id}/data/${sensor._id}?to-date=${sensor.lastMeasurement.createdAt}`
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

  const [yAxis, setYAxis] = useState<ApexYAxis[]>();
  const [series, setSeries] = useState([]); // Holding data for chart (Line and Bar)
  const [pieChartSeries, setPieChartSeries] = useState([]); // Holding data for chart (Pie)
  const [barChartSeries, setBarChartSeries] = useState([]); // Holding data for chart (Pie)
  const [pieChartLabels, setPieChartLabels] = useState([]);

  useEffect(() => {
    return () => {
      // Cleanup everything before a new device is selected!!!
      setIsOpen(false);
      setCompare(false);
      setSeries([]);
      setShouldFetch(false);
      setShouldFetch2(false);
      setSensor(null);
      setSensor2(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box]);

  useEffect(() => {
    if (data) {
      setSeries([
        ...series,
        {
          id: `${box.properties._id}-${sensor._id}`,
          name: `${box.properties.name}-${sensor.title}`,
          data: data.map(m => ({
            y: Number(m.value),
            x: new Date(m.createdAt),
          })),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (data2) {
      setSeries([
        ...series,
        {
          id: `${compareDevice.properties._id}-${sensor2._id}`,
          name: `${compareDevice.properties.name}-${sensor2.title}`,
          data: data2.map(m => ({
            y: Number(m.value),
            x: new Date(m.createdAt),
          })),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data2]);

  useEffect(() => {
    // Cleanup after box has changed
    return () => {
      setShouldFetch(false);
      setSensor(null);
      setSeries([]);
      setIsOpen(false);
    };
  }, [box]);

  const openCharts = (sensor: Sensor) => {
    setSensor(sensor);

    if (!isOpen) {
      setYAxis([
        {
          title: {
            text: sensor.title + ' ' + sensor.unit,
          },
        },
      ]);
      setIsOpen(!isOpen);
      setShouldFetch(!isOpen);
    } else {
      // Handle open chart
      const serie = series.find(serie => serie.id.includes(sensor._id));

      if (serie) {
        // Stop fetching data
        setShouldFetch(false);
        const newSeries = series.filter(
          serie => !serie.id.includes(sensor._id),
        );
        setSeries(newSeries);

        // If now series data existing, close chart and clean up
        if (newSeries.length === 0) {
          setIsOpen(false);
          setYAxis([]);
        }
      } else {
        setShouldFetch(true);

        // Check if axis is available
        const axisTitle = sensor.title + ' ' + sensor.unit;
        const axis = yAxis.find(yAxis => yAxis.title.text === axisTitle);
        if (!axis) {
          setYAxis([
            ...yAxis,
            {
              title: {
                text: axisTitle,
              },
              opposite: true,
            },
          ]);
        }
      }
    }
  };

  const openPieChart = () => {
    const series: number[] = [];
    const labels: string[] = [];

    for (const art of artenvielfalt[0]['arten'] as Array<ArtRecord>) {
      series.push(art.count);
      labels.push(art.art);
    }

    setPieChartLabels(labels);
    setPieChartSeries(series);

    setIsPieChartOpen(!isPieChartOpen);
  };

  const openBarChart = () => {
    setBarChartSeries([
      {
        id: 'versiegelung-1',
        name: 'versieglung',
        data: versiegelung.reverse().map(v => ({
          y: Number(v.value),
          x: new Date(v.createdAt).toLocaleDateString(),
        })),
      },
    ]);

    setIsBarChartOpen(!isBarChartOpen);
  };

  const handleCompare = event => {
    setCompare(event.target.checked);
  };

  const updateSeries = (
    enabled: boolean,
    device: Feature<Point>,
    sensor: Sensor,
  ) => {
    if (enabled) {
      setCompareDevice(device);
      setSensor2(sensor);
    } else {
      setSeries(
        series.filter(
          serie => serie.id !== `${device.properties._id}-${sensor._id}`,
        ),
      );
    }
    setShouldFetch2(enabled);
  };

  const removeCompareDevice = (device: Feature<Point>) => {
    const deviceProps = device.properties as Device;
    setSeries(
      series.filter(serie => serie.id.startsWith(device.properties._id)),
    );
    setCompareBoxes(
      compareBoxes.filter(box => box.properties._id !== deviceProps._id),
    );
  };

  const getMeasurementTile = (sensor: Sensor) => {
    const { _id, title, unit } = sensor;

    const value = Number(sensor.lastMeasurement?.value);

    let color = tileColors[title] ?? 'bg-violet-500';

    if (!value || isNaN(value)) {
      return;
    }

    return (
      <div
        key={_id}
        className={`m-2 flex aspect-square h-36 w-36 flex-col items-center justify-center rounded-xl p-2 shadow ${color}`}
        onClick={() => openCharts(sensor)}
      >
        <h1 className="mb-2 max-w-full overflow-hidden overflow-ellipsis text-sm font-bold text-white">
          {title}
        </h1>
        <h1 className="text-3xl font-semibold text-white">
          {value.toFixed(1)} {unit}
        </h1>
        <div className="mt-2 border-t-2">
          <kbd className="text-xs text-white">
            {format(
              new Date(sensor.lastMeasurement?.createdAt),
              'dd.MM.yyyy HH:mm',
            )}
          </kbd>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full divide-x-2 overflow-hidden overflow-y-scroll rounded-lg bg-white p-2 shadow">
      {box && (
        <div className="min-w[35%] flex w-[35%] flex-col divide-y-2 overflow-hidden">
          <div className="mb-2">
            <h1 className="mb-2 content-center text-center text-lg font-bold">
              {box.properties.name}
            </h1>
            <div className="flex justify-center">
              {box.properties.tags.map(tag => {
                return (
                  <span
                    className="mr-2 inline-flex items-center justify-center rounded-full bg-he-blue px-2 py-1 text-xs font-bold leading-none text-white"
                    key={tag}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="flex h-full flex-wrap justify-center overflow-auto align-middle">
            {box.properties.sensors.map(s => getMeasurementTile(s))}
            {artenvielfalt && artenvielfalt.length > 0 && (
              <>
                <div
                  className={`m-2 flex aspect-square h-36 w-36 flex-col items-center justify-center rounded-xl bg-he-artenvielfalt p-2 shadow`}
                  onClick={() => openPieChart()}
                >
                  <h1 className="mb-2 max-w-full overflow-hidden overflow-ellipsis text-sm font-bold text-white">
                    Simpson-Index
                  </h1>
                  <h1 className="text-3xl font-semibold text-white">
                    {artenvielfalt[0].simpsonIndex.toFixed(1)}
                  </h1>
                  <div className="mt-2 border-t-2">
                    <kbd className="text-xs text-white">
                      {format(
                        new Date(artenvielfalt[0].updatedAt),
                        'dd.MM.yyyy HH:mm',
                      )}
                    </kbd>
                  </div>
                </div>
              </>
            )}
            {versiegelung && versiegelung.length > 0 && (
              <>
                <div
                  className={`m-2 flex aspect-square h-36 w-36 flex-col items-center justify-center rounded-xl bg-he-undurchlaessigkeit p-2 shadow`}
                  onClick={() => openBarChart()}
                >
                  <h1 className="mb-2 max-w-full overflow-hidden overflow-ellipsis text-sm font-bold text-white">
                    Versiegelung
                  </h1>
                  <h1 className="text-3xl font-semibold text-white">
                    {versiegelung[0].value.toFixed(1)} %
                  </h1>
                  <div className="mt-2 border-t-2">
                    <kbd className="text-xs text-white">
                      {format(
                        new Date(versiegelung[0].updatedAt),
                        'dd.MM.yyyy HH:mm',
                      )}
                    </kbd>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {!box && (
        <div className="flex h-full w-full items-center justify-center">
          <h1 className="text-md content-center text-center font-bold">
            Wählt per Klick auf die Karte einen Schulstandort aus und ihr seht
            Messwerte von Umweltfaktoren an dieser Schule.
          </h1>
        </div>
      )}
      {isOpen && (
        <div className="flex w-full flex-col">
          <div className="m-2">
            <label htmlFor="compare">Vergleichen</label>
            <span>{compareBoxes.length} / 5</span>
            <input type="checkbox" name="compare" onChange={handleCompare} />
            {compareBoxes &&
              compareBoxes.map(box => {
                return (
                  <div className="flex flex-row" key={box.properties._id}>
                    <label
                      htmlFor={`${box.properties.name}-${box.properties._id}`}
                    >
                      {box.properties.name}
                    </label>
                    {box.properties.sensors.map(sensor => {
                      return (
                        <div key={sensor._id}>
                          <label htmlFor={`${sensor.title}-${sensor._id}`}>
                            {sensor.title}
                          </label>
                          <Toggle
                            updateSeries={updateSeries}
                            device={box}
                            sensor={sensor}
                          />
                        </div>
                      );
                    })}
                    <Button onClick={() => removeCompareDevice(box)}>
                      Entfernen
                    </Button>
                  </div>
                );
              })}
          </div>
          <div className="m-2 h-[90%] w-full overflow-hidden">
            <LineChart
              series={series}
              yaxis={yAxis}
              colors={[
                colors.he[sensor.title.toLocaleLowerCase()].DEFAULT,
                colors.he.red.DEFAULT,
                colors.he.aqua.DEFAULT,
                colors.he.lilac.DEFAULT,
              ]}
            />
          </div>
        </div>
      )}
      {isBarChartOpen && (
        <div className="m-2 h-[90%] w-full overflow-hidden">
          <BarChart
            series={barChartSeries}
            yaxis={yAxis}
            // colors={[colors.he[tabs[tab].id.toLowerCase()].DEFAULT]}
          />
        </div>
      )}
      {isPieChartOpen && (
        <div className="m-2 h-[95%] w-full overflow-hidden">
          <PieChart series={pieChartSeries} labels={pieChartLabels} />
        </div>
      )}
      {box !== undefined && !isOpen && !isPieChartOpen && !isBarChartOpen && (
        <div className="flex h-full w-full items-center justify-center text-center">
          <h1>
            Klicke auf eine Kachel um dir die Daten in einem Graphen anzuzeigen.
          </h1>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
