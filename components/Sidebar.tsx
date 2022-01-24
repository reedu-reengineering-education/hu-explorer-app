import { FilterIcon, SearchIcon } from '@heroicons/react/outline';
import React from 'react';
import LineChart, { DataPointProps } from './LineChart';
import { DateTime } from 'luxon';
import { Feature, Point } from 'geojson';

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
        className={`w-32 h-32 aspect-square rounded-xl shadow m-2 p-2 flex flex-col items-center justify-center ${color}`}
      >
        <h1 className="text-sm font-bold text-white mb-2 max-w-full overflow-hidden overflow-ellipsis">
          {title}
        </h1>
        <h1 className="text-3xl font-semibold text-white">
          {value.toFixed(1)}
        </h1>
        <h1 className="text-white">in {unit}</h1>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow h-full p-2 flex flex-col overflow-y-scroll">
      {box && (
        <h1 className="text-lg font-bold text-center content-center">
          {box.properties.name}
        </h1>
      )}
      {box && (
        <>
          {' '}
          <hr className="my-8" />
          <div className="flex flex-wrap justify-center">
            {box.properties.sensors.map(s => getMeasurementTile(s))}
          </div>
        </>
      )}
      {!box && (
        <h1 className="text-md font-bold text-center content-center">
          Wählt per Klick auf die Karte einen Schulstandort aus und ihr seht
          Messwerte von Umweltfaktoren an dieser Schule.
        </h1>
      )}
    </div>
  );
};

export default Sidebar;
