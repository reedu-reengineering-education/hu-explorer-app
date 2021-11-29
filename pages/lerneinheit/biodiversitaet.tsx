import React, { useState } from 'react';
import Spreadsheet, { CellBase, Matrix } from 'react-spreadsheet';

import { useLerneinheitParams } from '@/hooks/useLerneinheitParams';
import { Button } from '@/components/Elements/Button';

const Biodiversitaet = () => {
  const { schule } = useLerneinheitParams();

  const [data, setData] = useState<Matrix<CellBase>>([
    [
      { value: 'Versiegelung', readOnly: true, className: 'font-bold text-xl' },
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
    [
      {
        value: 'Artenvielfalt',
        readOnly: true,
        className: 'font-bold text-xl',
      },
      { value: '' },
    ],
    [
      {
        value: 'Tier',
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
  ]);

  return (
    <div className="flex flex-col">
      <div className="p-4">
        <h1 className="text-4xl">Biodiversität</h1>
        <div className="font-semibold text-gray-500">{schule}</div>
      </div>
      <div className="flex flex-col sm:flex-row divide-x-2 divide-blue-500">
        <div className="flex-grow md:w-2/3 p-4">
          <Spreadsheet data={data} onChange={setData} />
          <Button
            onClick={() =>
              setData([
                ...data,
                [
                  {
                    value: '',
                  },
                  { value: '' },
                ],
              ])
            }
          >
            Tier hinzufügen
          </Button>
        </div>
        <div className="flex-none md:w-1/3 p-4">Auswertung</div>
      </div>
    </div>
  );
};

export default Biodiversitaet;
