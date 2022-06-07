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
import MeasurementTile from './MeasurementTile';

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

  console.log(artenvielfalt);

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

  const getArtenvielfaltTile = (artenvielfalt: ArtenvielfaltRecord[]) => {
    const sensor: Sensor = {
      _id: artenvielfalt[0].id,
      title: 'Simpson-Index',
      unit: '',
      sensorType: '',
      lastMeasurement: {
        value: artenvielfalt[0].simpsonIndex.toFixed(2),
        createdAt: artenvielfalt[0].updatedAt,
      },
    };
    return <MeasurementTile sensor={sensor} openChart={openBarChart} />;
  };

  const getVersiegelungTile = (versiegelung: VersiegelungRecord[]) => {
    const sensor: Sensor = {
      _id: versiegelung[0].id,
      title: 'Versiegelung',
      unit: '%',
      sensorType: '',
      lastMeasurement: {
        value: versiegelung[0].value.toFixed(2),
        createdAt: versiegelung[0].updatedAt,
      },
    };
    return <MeasurementTile sensor={sensor} openChart={openPieChart} />;
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
            {box.properties.sensors.map(sensor => {
              return (
                <MeasurementTile
                  key={sensor._id}
                  sensor={sensor}
                  openChart={openCharts}
                />
              );
            })}

            {artenvielfalt &&
              artenvielfalt.length > 0 &&
              getArtenvielfaltTile(artenvielfalt)}

            {versiegelung &&
              versiegelung.length > 0 &&
              getVersiegelungTile(versiegelung)}
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
          {/* <div className="m-2">
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
          </div> */}
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
