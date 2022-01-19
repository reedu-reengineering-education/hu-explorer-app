import React, { useState } from 'react';

import { useExpeditionParams } from '@/hooks/useExpeditionParams';
import InputSheet from '@/components/Artenvielfalt/InputSheet';
import { Matrix } from 'react-spreadsheet';
import Tile from '@/components/Tile';

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
      value: 'Artname',
      readOnly: true,
    },
    { value: 'Häufigkeit', readOnly: true },
  ],
  [{ value: '' }, { value: '' }],
  [{ value: '' }, { value: '' }],
  [{ value: '' }, { value: '' }],
  [{ value: '' }, { value: '' }],
  [{ value: '' }, { value: '' }],
];

const Data = () => {
  const { schule, gruppe, daten } = useExpeditionParams();
  const [simpsonIndex, setSimpsonIndex] = useState<number>(0);

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
    const simpsonIndex: number =
      1 - numberOfSpecies / (numberOfOrganisms * (numberOfOrganisms - 1));
    console.log('Simpson Index', simpsonIndex);

    if (!Number.isNaN(simpsonIndex)) {
      setSimpsonIndex(+simpsonIndex.toFixed(2));
    }
  };

  if (daten === 'versiegelung') {
    return <InputSheet cells={versiegelungCells} />;
  } else if (daten === 'artenvielfalt') {
    return (
      <>
        <div className="flex">
          <div className="flex flex-col">
            <InputSheet
              cells={artenvielfaltCells}
              hideAddButton={false}
              onChange={changedData}
            />
          </div>
          <div className="flex flex-col-reverse m-3 pl-4">
            <Tile
              key="artenvielfaltsindex"
              title="Artenvielfalts-Index"
              min={simpsonIndex}
              color={{ bg: 'bg-he-blue-light', shadow: 'shadow-he-blue-light' }}
            ></Tile>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-row h-full w-full overflow-hidden">
        <div className="flex flex-row flex-wrap max-w-[40%] overflow-hidden mr-2">
          Nothing found!
        </div>
      </div>
    </>
  );
};

export default Data;
