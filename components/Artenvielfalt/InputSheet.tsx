import React, { useMemo, useState } from 'react';
import Spreadsheet, { Matrix, CellBase } from 'react-spreadsheet';
import { Button } from '../Elements/Button';

export interface InputSheetProps {
  cells: Matrix<CellBase>;
  hideAddButton?: boolean;
  onChange?: (data: Matrix<any>) => void;
}

const InputSheet = ({
  cells,
  hideAddButton = true,
  onChange,
}: InputSheetProps) => {
  const [data, setData] = useState<Matrix<CellBase>>(cells);

  const change = data => {
    setData(data);
    onChange(data);
  };

  return (
    <>
      <Spreadsheet data={data} onChange={change} />
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
