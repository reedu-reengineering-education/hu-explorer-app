import React, { useEffect, useState } from 'react';
import { Feature, Point } from 'geojson';
import { format } from 'date-fns';
import useSWR from 'swr';
import { ArtenvielfaltRecord, VersiegelungRecord } from '@prisma/client';
import LineChart from './LineChart';
import { fetcher } from '@/lib/fetcher';

const Sidebar = ({ box }: { box: Feature<Point> }) => {
  let [isOpen, setIsOpen] = useState<boolean>(false);
  const { data: artenvielfalt, error: artenvielfaltError } = useSWR<
    ArtenvielfaltRecord[]
  >(`/api/artenvielfalt/${box?.properties._id}`);
  const { data: versiegelung, error: versiegelungError } = useSWR<
    VersiegelungRecord[]
  >(`/api/versiegelung/${box?.properties._id}`);

  const [sensorId, setSensorId] = useState('');
  const [toDate, setToDate] = useState('');
  const [shouldFetch, setShouldFetch] = useState(false);
  const { data } = useSWR(
    shouldFetch
      ? `https://api.opensensemap.org/boxes/${box.properties._id}/data/${sensorId}?to-date=${toDate}`
      : null,
    fetcher,
  );
  console.log(data);

  const [yAxis, setYAxis] = useState<ApexYAxis>();
  const [series, setSeries] = useState([]);

  useEffect(() => {
    if (data) {
      setSeries([
        {
          name: 'Test',
          data: data.map(m => ({
            y: Number(m.value),
            x: new Date(m.createdAt),
          })),
        },
      ]);
    }
  }, [data]);

  useEffect(() => {
    // Cleanup after box has changed
    return () => {
      setShouldFetch(false);
      setToDate('');
      setSensorId('');
      setSeries([]);
      setIsOpen(false);
    };
  }, [box]);

  const tileColors = {
    Temperatur: 'bg-red-500',
    'rel. Luftfeuchte': 'bg-blue-500',
    'PM2.5': 'bg-slate-500',
    PM10: 'bg-stone-500',
    Luftdruck: 'bg-teal-500',
    Beleuchtungsstärke: 'bg-amber-400',
    'UV-Intensität': 'bg-green-400',
  };

  const openCharts = sensor => {
    console.log(sensor);

    setSensorId(sensor._id);
    setToDate(sensor.lastMeasurement.createdAt);

    setYAxis({
      title: {
        text: sensor.title + ' ' + sensor.unit,
      },
    });

    setIsOpen(!isOpen);
    setShouldFetch(!isOpen);
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
    <div className="flex h-full divide-x-2 overflow-y-scroll rounded-lg bg-white p-2 shadow">
      {box && (
        <div className="min-w[35%] flex w-[35%] flex-col divide-y-2">
          <div className="mb-2">
            <h1 className="mb-2 content-center text-center text-lg font-bold">
              {box.properties.name}
            </h1>
            <div className="flex justify-center">
              {box.properties.tags.map(tag => {
                return (
                  <span
                    className="mr-2 inline-flex items-center justify-center rounded-full bg-red-600 px-2 py-1 text-xs font-bold leading-none text-red-100"
                    key={tag}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
            {/* <hr className="my-8" /> */}
          </div>
          <div className="flex h-full flex-wrap justify-center align-middle">
            {box.properties.sensors.map(s => getMeasurementTile(s))}
            {artenvielfalt && artenvielfalt.length > 0 && (
              <>
                <div
                  className={`m-2 flex aspect-square h-36 w-36 flex-col items-center justify-center rounded-xl bg-he-green p-2 shadow`}
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
                  className={`m-2 flex aspect-square h-36 w-36 flex-col items-center justify-center rounded-xl bg-he-yellow p-2 shadow`}
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
      {!isOpen && (
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
