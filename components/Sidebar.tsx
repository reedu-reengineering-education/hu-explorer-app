import { FilterIcon, SearchIcon } from '@heroicons/react/outline';
import React from 'react';
import LineChart, { DataPointProps } from './LineChart';
import { DateTime } from 'luxon';

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

const Sidebar = () => {
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

  return (
    <div className="bg-white rounded-xl shadow h-full p-8 flex flex-col overflow-y-scroll">
      <h1 className="text-3xl font-bold text-center">Humboldt Explorers</h1>
      <hr className="my-8" />
      <div className="flex w-full">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl flex w-full mr-2">
          <FilterIcon className="h-6 w-6 text-blue-100 mr-2" />
          Filter
        </button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl flex w-full ml-2 ">
          <SearchIcon className="h-6 w-6 text-blue-100 mr-2" />
          Suche
        </button>
      </div>
      <hr className="my-8" />
      <div className="flex justify-evenly">
        <div className="w-32 h-32 rounded-xl shadow mr-4 flex flex-col items-center justify-center bg-blue-500">
          <h1 className="text-sm font-bold text-white mb-2">Temperatur</h1>
          <h1 className="text-4xl font-semibold text-white">5,42</h1>
          <h1 className="text-white">in °C</h1>
        </div>
        <div className="w-32 h-32 rounded-xl shadow ml-4 flex flex-col items-center justify-center bg-blue-500">
          <h1 className="text-sm font-bold text-white mb-2">
            rel. Luftfeuchte
          </h1>
          <h1 className="text-4xl font-semibold text-white">82</h1>
          <h1 className="text-white">in %</h1>
        </div>
      </div>
      <hr className="my-8" />
      <LineChart series={series} yaxis={yaxis}></LineChart>
      <LineChart series={series2} yaxis={yaxis2}></LineChart>
    </div>
  );
};

export default Sidebar;
