import React, { useMemo, useState } from 'react';
import Spreadsheet, { Matrix, CellBase } from 'react-spreadsheet';
import { Button } from '../Elements/Button';

const InputSheet = () => {
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
  ]);

  return (
    <>
      <Spreadsheet data={data} onChange={setData} />
      <Button
        className="m-auto"
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
        Art hinzufügen
      </Button>
    </>
  );
};

export default InputSheet;
