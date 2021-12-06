import React, { useState } from 'react';
import Spreadsheet from 'react-spreadsheet';

const OsemSheet = () => {
  const [data, setData] = useState([
    [{ value: 'Zeitstempel' }, { value: 'Lautstärke in dB' }],
    ...Array.from({ length: 10 }, e => [
      {
        value: new Date(
          +new Date() - Math.floor(Math.random() * 10000000000),
        ).toLocaleString(),
      },
      { value: Math.floor(Math.random() * 120) + 1 },
    ]),
    [{ value: '' }, { value: '' }, { value: '' }],
    [{ value: 'Maximum' }, { value: '=MAX(B2:B11)' }],
  ]);

  return <Spreadsheet data={data} onChange={setData} />;
};

export default OsemSheet;
