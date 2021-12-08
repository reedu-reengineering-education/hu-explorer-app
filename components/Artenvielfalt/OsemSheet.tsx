import React, { useState } from 'react';
import Spreadsheet, { Point } from 'react-spreadsheet';
import { SheetProps } from '../Schall/OsemSheet';

const OsemSheet = ({ series }: SheetProps) => {
  const cellHeader = series.map(serie => {
    return {
      value: serie.name,
      readOnly: true,
    };
  });
  const [data, setData] = useState([
    [{ value: 'Zeitstempel', readOnly: true }, ...cellHeader],
    ...Array.from({ length: 10 }, e => [
      {
        value: new Date(
          +new Date() - Math.floor(Math.random() * 10000000000),
        ).toLocaleString(),
      },
      { value: Math.floor(Math.random() * 20) + 1 },
      { value: Math.floor(Math.random() * 100) + 1 },
      { value: Math.floor(Math.random() * 20) + 1 },
      { value: Math.floor(Math.random() * 100) + 1 },
    ]),
    [{ value: '' }, { value: '' }, { value: '' }],
    [
      { value: 'Maximum' },
      { value: '=MAX(B1:B11)' },
      { value: '=MAX(C1:C11)' },
    ],
  ]);

  // const onKeyDown = (event: Point[]) => {
  //   console.log(event);
  // }

  return <Spreadsheet data={data} onChange={setData} />;
};

export default OsemSheet;
