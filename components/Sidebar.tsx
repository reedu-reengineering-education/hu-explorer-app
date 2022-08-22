import React, { useEffect, useState } from 'react';
import { Feature, Point } from 'geojson';
import useSWR from 'swr';
import {
  ArtenvielfaltRecord,
  ArtRecord,
  VersiegelungRecord,
} from '@prisma/client';
import LineChart from './LineChart';
import { fetcher } from '@/lib/fetcher';
import PieChart from './PieChart';
import { useTailwindColors } from '@/hooks/useTailwindColors';
import { Sensor } from '@/types/osem';
import BarChart from './BarChart';
import MeasurementTile from './MeasurementTile';
import useSharedCompareSensors from '@/hooks/useCompareSensors';

const Sidebar = ({
  box,
  dateRange,
}: {
  box: Feature<Point>;
  dateRange: Date[];
}) => {
  const colors = useTailwindColors();
  const { compareSensors } = useSharedCompareSensors();

  useEffect(() => {
    // TODO: Check Artenvielfalt und Versieglungs data

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

  // TODO: Handle Artenvielfalt und Versieglungs data of compare device
  const { data: data2 } = useSWR(
    shouldFetch2
      ? `https://api.opensensemap.org/boxes/${compareDevice?.properties._id}/data/${sensor2._id}?to-date=${sensor2.lastMeasurement.createdAt}`
      : null,
    fetcher,
  );

  const [yAxis, setYAxis] = useState<ApexYAxis[]>();
  const [series, setSeries] = useState([]); // Holding data for chart (Line and Bar)
  const [seriesColors, setSeriesColors] = useState([]);
  const [pieChartSeries, setPieChartSeries] = useState([]); // Holding data for chart (Pie)
  const [barChartSeries, setBarChartSeries] = useState([]); // Holding data for chart (Pie)
  const [pieChartLabels, setPieChartLabels] = useState([]);

  useEffect(() => {
    return () => {
      // Cleanup everything before a new device is selected!!!
      setIsOpen(false);
      setIsBarChartOpen(false);
      setIsPieChartOpen(false);
      setSeries([]);
      setBarChartSeries([]);
      setPieChartSeries([]);
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
        ...series.filter(serie => !serie.id.includes(sensor._id)),
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
      setSeriesColors([
        ...seriesColors,
        colors.he[sensor2.title.toLocaleLowerCase()].DEFAULT,
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
      setYAxis([]);
      setSeriesColors([]);
      setIsOpen(false);
    };
  }, [box]);

  const openCharts = (sensor: Sensor) => {
    setSensor(sensor);
    const sensorColor = colors.he[sensor.title.toLocaleLowerCase()].DEFAULT;

    if (!isOpen) {
      setYAxis([
        {
          title: {
            text: sensor.title + ' ' + sensor.unit,
          },
        },
      ]);
      setIsOpen(!isOpen);
      setSeriesColors([...seriesColors, sensorColor]);
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
          setSeriesColors([]);
          setYAxis([]);
        } else {
          const colors = seriesColors.filter(color => color !== sensorColor);
          setSeriesColors(colors);
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
        setSeriesColors([...seriesColors, sensorColor]);
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

  const updateSeries = (
    enabled: boolean,
    device: Feature<Point>,
    sensor: Sensor,
  ) => {
    if (enabled) {
      setCompareDevice(device);
      setSensor2(sensor);
    } else {
      const seriesIndex = series.findIndex(
        serie => serie.id === `${device.properties._id}-${sensor._id}`,
      );
      setSeries(
        series.filter(
          serie => serie.id !== `${device.properties._id}-${sensor._id}`,
        ),
      );
      setSeriesColors(
        seriesColors.filter((colors, idx) => idx !== seriesIndex),
      );
    }
    setShouldFetch2(enabled);
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
    return <MeasurementTile sensor={sensor} openChart={openPieChart} />;
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
              value: versiegelung[0].value.toFixed(2),
              createdAt: versiegelung[0].updatedAt,
            },
          }
        : {}),
    };
    return <MeasurementTile sensor={sensor} openChart={openBarChart} />;
  };

  return (
    <div className="flex h-full divide-x-2 overflow-hidden overflow-y-scroll rounded-lg bg-white p-2 shadow">
      {box && (
        <div className="min-w[40%] flex w-[40%] flex-col divide-y-2 overflow-hidden">
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
      {!box && (
        <div className="flex h-full w-full items-center justify-center">
          <h1 className="text-md content-center text-center font-bold">
            Wählt per Klick auf die Karte einen Schulstandort aus und ihr seht
            Messwerte von Umweltfaktoren an dieser Schule.
          </h1>
        </div>
      )}
      {isOpen && (
        <div className="flex w-[95%] flex-col overflow-hidden">
          <div className="m-2 h-[95%] w-full overflow-hidden">
            <LineChart series={series} yaxis={yAxis} colors={seriesColors} />
          </div>
        </div>
      )}
      {isBarChartOpen && (
        <div className="m-2 h-[95%] w-full overflow-hidden">
          <BarChart
            series={barChartSeries}
            yaxis={yAxis}
            colors={[colors.he.undurchlaessigkeit.DEFAULT]}
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
