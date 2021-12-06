import { FilterIcon, SearchIcon } from '@heroicons/react/outline';
import React from 'react';
import { Button } from './Elements/Button';
import LineChart from './LineChart';

const Sidebar = () => {
  return (
    <div className="bg-white rounded-xl shadow h-full p-8 flex flex-col overflow-y-scroll">
      <h1 className="text-3xl font-bold">Humboldt Explorers</h1>
      <hr className="my-8" />
      <div className="flex w-full">
        <Button
          startIcon={<FilterIcon className="h-6 w-6 text-blue-100 mr-2" />}
        >
          Filter
        </Button>
        <Button
          startIcon={<SearchIcon className="h-6 w-6 text-blue-100 mr-2" />}
        >
          Suche
        </Button>
      </div>
      <hr className="my-8" />
      <div className="flex">
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
      <LineChart></LineChart>
      <LineChart></LineChart>
    </div>
  );
};

export default Sidebar;