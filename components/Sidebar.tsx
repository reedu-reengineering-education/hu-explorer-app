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

export interface Measurement {
  value: string;
  createdAt: string;
}

export interface Sensor {
  _id: string;
  title: string;
  unit: string;
  sensorType: string;
  lastMeasurement: Measurement;
}

const Sidebar = ({ box }: { box: Feature<Point> }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isPieChartOpen, setIsPieChartOpen] = useState<boolean>(false);
  const { data: artenvielfalt, error: artenvielfaltError } = useSWR<
    ArtenvielfaltRecord[]
  >(`/api/artenvielfalt/${box?.properties._id}`);
  console.log(artenvielfalt);
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
  console.log(data);

  const [yAxis, setYAxis] = useState<ApexYAxis>();
  const [series, setSeries] = useState([]);
  const [pieChartSeries, setPieChartSeries] = useState([]);
  const [pieChartLabels, setPieChartLabels] = useState([]);

  useEffect(() => {
    if (data) {
      setSeries([
        {
          name: sensor.title,
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
    // Cleanup after box has changed
    return () => {
      setShouldFetch(false);
      setSensor(null);
      setSeries([]);
      setIsOpen(false);
    };
  }, [box]);

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

  const openCharts = sensor => {
    console.log(sensor);

    setSensor(sensor);

    setYAxis({
      title: {
        text: sensor.title + ' ' + sensor.unit,
      },
    });

    setIsOpen(!isOpen);
    setShouldFetch(!isOpen);
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

  const getMeasurementTile = sensor => {
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
        <h1 className="text-md content-center text-center font-bold">
          Wählt per Klick auf die Karte einen Schulstandort aus und ihr seht
          Messwerte von Umweltfaktoren an dieser Schule.
        </h1>
      )}
      {isOpen && (
        <div className="m-2 h-[95%] w-full overflow-hidden">
          <LineChart series={series} yaxis={yAxis} />
        </div>
      )}
      {isPieChartOpen && (
        <div className="m-2 h-[95%] w-full overflow-hidden">
          <PieChart series={pieChartSeries} labels={pieChartLabels} />
        </div>
      )}
      {!isOpen && !isPieChartOpen && (
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
