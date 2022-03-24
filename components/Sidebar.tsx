import React, { useState } from 'react';
import { DateTime } from 'luxon';
import { Feature, Point } from 'geojson';
import { format } from 'date-fns';
import useSWR from 'swr';
import { ArtenvielfaltRecord, VersiegelungRecord } from '@prisma/client';
import MyModal from './Modal';

const startDateTime = DateTime.local()
  .setLocale('de')
  .minus({ hours: 12 })
  .toUTC();

const generateData = (range: number) => {
  return Array.from({ length: 72 }, (_, i) => {
    return {
      y: Math.floor(Math.random() * range) + 1,
      x: startDateTime
        .plus({ minutes: 10 * i })
        .toUTC()
        .setLocale('de')
        .toString(),
    };
  });
};

const Sidebar = ({ box }: { box: Feature<Point> }) => {
  let [isOpen, setIsOpen] = useState<boolean>(false);
  const { data: artenvielfalt, error: artenvielfaltError } = useSWR<
    ArtenvielfaltRecord[]
  >(`/api/artenvielfalt/${box?.properties._id}`);
  const { data: versiegelung, error: versiegelungError } = useSWR<
    VersiegelungRecord[]
  >(`/api/versiegelung/${box?.properties._id}`);

  const series = [
    {
      name: 'Temperatur',
      data: generateData(10),
    },
  ];

  const series2 = [
    {
      name: 'Bodenfeuchte',
      data: generateData(100),
    },
  ];

  const yaxis = {
    title: {
      text: 'Temperatur in °C',
    },
  };

  const yaxis2 = {
    title: {
      text: 'Bodenfeuchte in %',
    },
  };

  const tileColors = {
    Temperatur: 'bg-red-500',
    'rel. Luftfeuchte': 'bg-blue-500',
    'PM2.5': 'bg-slate-500',
    PM10: 'bg-stone-500',
    Luftdruck: 'bg-teal-500',
    Beleuchtungsstärke: 'bg-amber-400',
    'UV-Intensität': 'bg-green-400',
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
        onClick={() => setIsOpen(true)}
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
    <div className="flex h-full overflow-y-scroll rounded-lg bg-white p-2 shadow">
      {box && (
        <h1 className="content-center text-center text-lg font-bold">
          {box.properties.name}
        </h1>
      )}
      {/* TODO Bild der Schule einfügen */}
      {box && (
        <>
          {' '}
          <hr className="my-8" />
          <div className="flex flex-wrap justify-center">
            {box.properties.sensors.map(s => getMeasurementTile(s))}
          </div>
        </>
      )}
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
      {!box && (
        <h1 className="text-md content-center text-center font-bold">
          Wählt per Klick auf die Karte einen Schulstandort aus und ihr seht
          Messwerte von Umweltfaktoren an dieser Schule.
        </h1>
      )}
      <MyModal open={isOpen} onClose={setIsOpen} />
    </div>
  );
};

export default Sidebar;
