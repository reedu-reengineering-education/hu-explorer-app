import React, { useState } from 'react';
import Spreadsheet, { Matrix, Point } from 'react-spreadsheet';
import { SheetProps } from '../Schall/OsemSheet';

const OsemSheet = ({
  series,
}: {
  series: { name: string; data: number[] }[];
}) => {
  const cellHeader = series.map(serie => {
    return {
      value: serie.name,
      readOnly: true,
    };
  });
  const [data, setData] = useState<Matrix<{ value: string | number }>>([
    [...cellHeader],
    ...series[0].data.map((e, i) => {
      return series.map(s => ({ value: Number(s.data[i]) }));
    }),
    [{ value: '' }, { value: '' }],
    [{ value: '=MAX(A2:A11)' }, { value: '=MAX(B2:B11)' }],
  ]);

  // const onKeyDown = (event: Point[]) => {
  //   console.log(event);
  // }

  return <Spreadsheet data={data} onChange={setData} />;
};

export default OsemSheet;
