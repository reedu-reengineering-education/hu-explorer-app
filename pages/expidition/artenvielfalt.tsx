import React, { useState } from 'react';

import { useExpeditionParams } from '@/hooks/useExpeditionParams';
import InputSheet from '@/components/Artenvielfalt/InputSheet';
import OsemSheet from '@/components/Artenvielfalt/OsemSheet';
import Map from '@/components/Map';
import Tabs, { Tab } from '@/components/Tabs';
import BarChart from '@/components/BarChart';
import { Matrix } from 'react-spreadsheet';

const generateData = (range: number, length: number) => {
  return Array.from({ length: length }, (_, i) => {
    return Math.floor(Math.random() * range) + 1;
  });
};

const generateRandomData = (range: number, length: number) => {
  return Array.from({ length: length }, (_, i) => {
    return parseFloat(Math.random().toFixed(2));
  });
};

const seriesData = [
  {
    name: 'Temperatur in °C',
    data: generateData(50, 5),
  },
];

const seriesData4 = [
  {
    name: 'Versiegelung',
    data: generateData(100, 1),
  },
];

const seriesData3 = [
  {
    name: 'Bodenfeuchte in %',
    data: generateData(100, 1),
  },
];

const versiegelungCells = [
  [
    { value: 'Versiegelung', readOnly: true, className: 'font-bold text-md' },
    { value: '' },
  ],
  [
    {
      value: 'Versiegelungsgrad in %',
      readOnly: true,
    },
    { value: 0 },
  ],
  [{ value: '', readOnly: true }],
];
const artenvielfaltCells = [
  [
    {
      value: 'Artenvielfalt',
      readOnly: true,
      className: 'font-bold text-md',
    },
    { value: '' },
  ],
  [
    {
      value: 'Art',
      readOnly: true,
    },
    { value: 'Anzahl', readOnly: true },
  ],
  [
    {
      value: '',
    },
    { value: '' },
  ],
];

const Artenvielfalt = () => {
  const { schule, gruppe } = useExpeditionParams();
  const [tab, setTab] = useState(0);
  const [series, setSeries] = useState(seriesData);
  const [speciesIndex, setSpeciesIndex] = useState([
    {
      name: 'pflanzliche Artenvielfalt',
      data: [],
    },
  ]);

  const changedData = (data: Matrix<any>) => {
    const matrix = [...data];
    const speciesData = matrix.slice(2);
    let numberOfOrganisms = 0;
    const numberOfSpecies = speciesData
      .flat()
      .filter((_, i) => i % 2 === 1)
      .map(value => {
        // Check if value is a number
        if (isNaN(parseInt(value.value))) return 0;

        numberOfOrganisms = numberOfOrganisms + parseInt(value.value);
        return parseInt(value.value) * (parseInt(value.value) - 1);
      })
      .reduce((prev, curr) => prev + curr);
    const simpsonIndex =
      1 - numberOfSpecies / (numberOfOrganisms * (numberOfOrganisms - 1));
    console.log('Simpson Index', simpsonIndex);

    setSpeciesIndex([
      {
        name: 'pflanzliche Artenvielfalt',
        data: [simpsonIndex, ...generateRandomData(1, 4)],
      },
    ]);
  };

  const tabs: Tab[] = [
    {
      title: 'Artenvielfalt',
      component: (
        <InputSheet
          cells={artenvielfaltCells}
          hideAddButton={false}
          onChange={changedData}
        />
      ),
    },
    {
      title: 'Versiegelung',
      component: <InputSheet cells={versiegelungCells} />,
      hypothesis:
        'Eine hohe Bodenfeuchte hängt zusammen mit einer hohen pflanzlichen Artenvielfalt.',
    },
    {
      title: 'Temperatur',
      component: (
        <OsemSheet
          series={[
            {
              name: 'Temperatur in °C',
              data: generateData(50, 20),
            },
          ]}
        />
      ),
      hypothesis:
        'Eine hohe Temperatur hängt zusammen mit einer geringen pflanzlichen Artenvielfalt.',
    },
    {
      title: 'Bodenfeuchte',
      component: (
        <OsemSheet
          series={[
            {
              name: 'Bodenfeuchte in %',
              data: generateData(100, 20),
            },
          ]}
        />
      ),
      hypothesis:
        'Eine hohe Bodenfeuchte hängt zusammen mit einer hohen pflanzlichen Artenvielfalt.',
    },
  ];

  const [colors, setColor] = useState('');
  const [xaxis, setXaxis] = useState({
    categories: [
      'senseBox 1',
      'senseBox 2',
      'senseBox 3',
      'senseBox 4',
      'senseBox 5',
    ],
  });
  const [yaxis, setYaxis] = useState<ApexYAxis[]>([
    {
      seriesName: 'Temperatur',
      showAlways: true,
      title: {
        text: 'Temperatur in °C',
      },
    },
  ]);

  const onChange = (tab: number) => {
    setTab(tab);
    switch (tab) {
      case 2:
        setSeries(seriesData);
        setColor('#84CC16');
        setYaxis([
          {
            seriesName: 'Temperatur',
            showAlways: true,
            title: {
              text: 'Temperatur in °C',
            },
          },
        ]);
        break;
      case 3:
        setSeries(seriesData3);
        setColor('#F59E0B');
        setYaxis([
          {
            seriesName: 'Bodenfeuchte',
            showAlways: true,
            title: {
              text: 'Bodenfeuchte in %',
            },
          },
        ]);
        break;
      case 1:
        setSeries(seriesData4);
        setColor('#737373');
        setYaxis([
          {
            seriesName: 'Versiegelung',
            showAlways: true,
            title: {
              text: 'Versiegelung in %',
            },
          },
        ]);
        break;
      default:
        break;
    }
  };

  const yaxis2: ApexYAxis[] = [
    {
      seriesName: 'plflanzliche Artenvielfalt',
      showAlways: true,
      max: 1.0,
      title: {
        text: 'Artenvielfaltsindex',
      },
      labels: {
        formatter: function (value) {
          return value.toFixed(2);
        },
      },
    },
  ];

  return (
    <>
      {/* <div className="flex flex-row">
        <div className="p-4">
          <h1 className="text-4xl">Artenvielfalt</h1>
          <div className="font-semibold text-gray-500">Schule: {schule}</div>
          <div className="font-semibold text-gray-500">Gruppe: {gruppe}</div>
        </div>
      </div> */}
      <div className="flex flex-row h-full w-full overflow-hidden">
        <div className="flex flex-row flex-wrap max-w-[40%] overflow-hidden mr-2">
          <Tabs tabs={tabs} onChange={onChange}></Tabs>
        </div>
        <div className="flex flex-col w-full">
          <div className="flex-auto w-full max-h-[25%] mb-4">
            <Map width="100%" height="100%" />
          </div>
          <div className="flex-auto w-full max-h-[37%] mb-4">
            <BarChart
              series={series}
              yaxis={yaxis}
              xaxis={xaxis}
              colors={[colors]}
            ></BarChart>
          </div>
          <div className="flex-auto w-full max-h-[37%]">
            <BarChart
              series={speciesIndex}
              yaxis={yaxis2}
              xaxis={xaxis}
              colors={['#8B5CF6']}
            ></BarChart>
          </div>
        </div>
      </div>
    </>
  );
};

export default Artenvielfalt;
