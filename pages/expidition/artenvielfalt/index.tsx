import React, { useEffect, useState } from 'react';

import { useExpeditionParams } from '@/hooks/useExpeditionParams';
import InputSheet from '@/components/Artenvielfalt/InputSheet';
import OsemSheet from '@/components/Artenvielfalt/OsemSheet';
import Map from '@/components/Map';
import Tabs, { Tab } from '@/components/Tabs';
import BarChart from '@/components/BarChart';
import { useTailwindColors } from '@/hooks/useTailwindColors';

const groups1 = [
  'sensebox1',
  'sensebox2',
  'sensebox3',
  'sensebox4',
  'sensebox5',
];

const groups2 = [
  'sensebox6',
  'sensebox7',
  'sensebox8',
  'sensebox9',
  'sensebox10',
];

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

const temperatureData = {
  name: 'Lufttemperatur in °C',
  data: generateData(50, 5),
};

const versiegelungData = {
  name: 'Undurchlässigkeit',
  data: generateData(100, 5),
};

const bodenfeuchteData = {
  name: 'Bodenfeuchte in %',
  data: generateData(100, 5),
};

const artenvielfaltData = {
  name: 'pflanzliche Artenvielfalt',
  data: generateRandomData(1, 5),
};

const versiegelungCells = [
  [
    {
      value: 'Undurchlässigkeit',
      readOnly: true,
      className: 'font-bold text-md',
    },
    { value: '' },
  ],
  [
    {
      value: 'Undurchlässigkeit in %',
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
  const [series, setSeries] = useState([]);

  // console.log(series);

  const colors = useTailwindColors();

  // const [speciesIndex, setSpeciesIndex] = useState([
  //   {
  //     name: 'pflanzliche Artenvielfalt',
  //     data: [],
  //   },
  // ]);

  // const changedData = (data: Matrix<any>) => {
  //   const matrix = [...data];
  //   const speciesData = matrix.slice(2);
  //   let numberOfOrganisms = 0;
  //   const numberOfSpecies = speciesData
  //     .flat()
  //     .filter((_, i) => i % 2 === 1)
  //     .map(value => {
  //       // Check if value is a number
  //       if (isNaN(parseInt(value.value))) return 0;

  //       numberOfOrganisms = numberOfOrganisms + parseInt(value.value);
  //       return parseInt(value.value) * (parseInt(value.value) - 1);
  //     })
  //     .reduce((prev, curr) => prev + curr);
  //   const simpsonIndex =
  //     1 - numberOfSpecies / (numberOfOrganisms * (numberOfOrganisms - 1));
  //   console.log('Simpson Index', simpsonIndex);

  //   setSpeciesIndex([
  //     {
  //       name: 'pflanzliche Artenvielfalt',
  //       data: [simpsonIndex, ...generateRandomData(1, 4)],
  //     },
  //   ]);
  // };

  const tabs: Tab[] = [
    // {
    //   title: 'Artenvielfalt',
    //   component: (
    //     <InputSheet
    //       cells={artenvielfaltCells}
    //       hideAddButton={false}
    //       onChange={changedData}
    //     />
    //   ),
    // },
    {
      id: 'Lufttemperatur',
      title: 'Lufttemperatur',
      component: (
        <OsemSheet
          series={[
            {
              name: 'Lufttemperatur in °C',
              data: generateData(50, 20),
            },
          ]}
        />
      ),
      hypothesis:
        'Eine hohe Temperatur hängt zusammen mit einer geringen pflanzlichen Artenvielfalt.',
    },
    {
      id: 'Bodenfeuchte',
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
    {
      id: 'Undurchlaessigkeit',
      title: 'Undurchlässigkeit',
      component: <InputSheet cells={versiegelungCells} />,
      hypothesis:
        'Eine hohe Bodenfeuchte hängt zusammen mit einer hohen pflanzlichen Artenvielfalt.',
    },
  ];

  const [xaxis, setXaxis] = useState({
    categories: groups1,
  });

  useEffect(() => {
    if (groups2.includes(gruppe as string)) {
      setXaxis({
        categories: groups2,
      });
    }
  }, [gruppe]);

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
      case 0:
        setSeries([temperatureData, artenvielfaltData]);
        setYaxis([
          {
            seriesName: 'Lufttemperatur',
            showAlways: true,
            title: {
              text: 'Lufttemperatur in °C',
              style: {
                color: '#56bfc6',
              },
            },
            axisBorder: {
              show: true,
              color: '#56bfc6',
            },
          },
          {
            seriesName: 'plflanzliche Artenvielfalt',
            showAlways: true,
            max: 1.0,
            title: {
              text: 'Artenvielfaltsindex',
              style: {
                color: '#6bbe98',
              },
            },
            opposite: true,
            labels: {
              formatter: function (value) {
                return value.toFixed(2);
              },
            },
            axisBorder: {
              show: true,
              color: '#6bbe98',
            },
          },
        ]);
        break;
      case 1:
        setSeries([bodenfeuchteData, artenvielfaltData]);
        setYaxis([
          {
            seriesName: 'Bodenfeuchte',
            showAlways: true,
            title: {
              text: 'Bodenfeuchte in %',
              style: {
                color: '#7d8bc5',
              },
            },
            axisBorder: {
              show: true,
              color: '#7d8bc5',
            },
          },
          {
            seriesName: 'plflanzliche Artenvielfalt',
            showAlways: true,
            max: 1.0,
            title: {
              text: 'Artenvielfaltsindex',
              style: {
                color: '#6bbe98',
              },
            },
            opposite: true,
            labels: {
              formatter: function (value) {
                return value.toFixed(2);
              },
            },
            axisBorder: {
              show: true,
              color: '#6bbe98',
            },
          },
        ]);
        break;
      case 2:
        setSeries([versiegelungData, artenvielfaltData]);
        setYaxis([
          {
            seriesName: 'Undurchlässigkeit',
            showAlways: true,
            title: {
              text: 'Undurchlässigkeit in %',
              style: {
                color: '#004c90',
              },
            },
            axisBorder: {
              show: true,
              color: '#004c90',
            },
          },
          {
            seriesName: 'plflanzliche Artenvielfalt',
            showAlways: true,
            max: 1.0,
            title: {
              text: 'Artenvielfaltsindex',
              style: {
                color: '#6bbe98',
              },
            },
            opposite: true,
            labels: {
              formatter: function (value) {
                return value.toFixed(2);
              },
            },
            axisBorder: {
              show: true,
              color: '#6bbe98',
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
      <div className="flex flex-row h-full w-full overflow-hidden">
        <div className="flex flex-col w-full">
          <div className="flex-auto w-full h-[25%] max-h-[25%] mb-4">
            <Map width="100%" height="100%" />
          </div>
          <div className="flex flex-col flex-wrap overflow-hidden mr-2">
            <Tabs tabs={tabs} onChange={onChange} showHypothesis={true}></Tabs>
          </div>
          <div className="flex-auto w-full mb-4">
            <BarChart
              series={series}
              yaxis={yaxis}
              xaxis={xaxis}
              colors={[
                colors.he[tabs[tab].id.toLowerCase()].DEFAULT,
                colors.he.artenvielfalt.DEFAULT,
              ]}
            ></BarChart>
          </div>
        </div>
      </div>
    </>
  );
};

export default Artenvielfalt;
