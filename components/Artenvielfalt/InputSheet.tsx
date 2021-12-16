import React, { useMemo, useState } from 'react';
import Spreadsheet, { Matrix, CellBase } from 'react-spreadsheet';
import { Button } from '../Elements/Button';

export interface InputSheetProps {
  cells: Matrix<CellBase>;
  hideAddButton?: boolean;
}

const InputSheet = ({ cells, hideAddButton = true }: InputSheetProps) => {
  const [data, setData] = useState<Matrix<CellBase>>(cells);

  return (
    <>
      <Spreadsheet data={data} onChange={setData} />
      <Button
        className={`m-auto ${hideAddButton ? 'hidden' : ''}`}
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
