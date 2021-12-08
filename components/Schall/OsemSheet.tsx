import React, { useState } from 'react';
import Spreadsheet from 'react-spreadsheet';
import { SeriesProps } from '../LineChart';
import { DateTime } from 'luxon';

export interface SheetProps {
  series: SeriesProps[];
}

const OsemSheet = ({ series }: SheetProps) => {
  const cellHeader = series.map(serie => {
    return {
      value: serie.name,
    };
  });

  const [data, setData] = useState([
    [{ value: 'Zeitstempel' }, ...cellHeader],
    ...Array.from({ length: 10 }, (_, i) => [
      {
        value: DateTime.local(2021, 12, 8, 13, 0, 0)
          .plus({ minutes: i })
          .setLocale('de')
          .toLocaleString(DateTime.DATETIME_SHORT),
      },
      { value: Math.floor(Math.random() * 120) + 1 },
      { value: Math.floor(Math.random() * 120) + 1 },
      { value: Math.floor(Math.random() * 120) + 1 },
      { value: Math.floor(Math.random() * 120) + 1 },
      { value: Math.floor(Math.random() * 120) + 1 },
    ]),
    [{ value: '' }, { value: '' }, { value: '' }],
    [{ value: 'Maximum' }, { value: '=MAX(B2:B11)' }],
  ]);

  return <Spreadsheet data={data} onChange={setData} />;
};

export default OsemSheet;
