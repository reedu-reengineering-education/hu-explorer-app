import { FilterIcon, SearchIcon } from '@heroicons/react/outline';
import React from 'react';
import { Button } from './Elements/Button';
import LineChart from './LineChart';

const Sidebar = () => {
  return (
    <div className="flex h-full flex-col overflow-y-scroll rounded-xl bg-white p-8 shadow">
      <h1 className="text-3xl font-bold">Humboldt Explorers</h1>
      <hr className="my-8" />
      <div className="flex w-full">
        <Button
          startIcon={<FilterIcon className="mr-2 h-6 w-6 text-blue-100" />}
        >
          Filter
        </Button>
        <Button
          startIcon={<SearchIcon className="mr-2 h-6 w-6 text-blue-100" />}
        >
          Suche
        </Button>
      </div>
      <hr className="my-8" />
      <div className="flex">
        <div className="mr-4 flex h-32 w-32 flex-col items-center justify-center rounded-xl bg-blue-500 shadow">
          <h1 className="mb-2 text-sm font-bold text-white">Temperatur</h1>
          <h1 className="text-4xl font-semibold text-white">5,42</h1>
          <h1 className="text-white">in °C</h1>
        </div>
        <div className="ml-4 flex h-32 w-32 flex-col items-center justify-center rounded-xl bg-blue-500 shadow">
          <h1 className="mb-2 text-sm font-bold text-white">
            rel. Luftfeuchte
          </h1>
          <h1 className="text-4xl font-semibold text-white">82</h1>
          <h1 className="text-white">in %</h1>
        </div>
      </div>
      <hr className="my-8" />
      {/* <LineChart></LineChart>
      <LineChart></LineChart> */}
    </div>
  );
};

export default Sidebar;
