import React, { useEffect, useState } from 'react';
import Spreadsheet, { Matrix, CellBase } from 'react-spreadsheet';
import { Button } from '../Elements/Button';

export interface InputSheetProps {
  cells: Matrix<CellBase>;
  hideAddButton?: boolean;
  onChange?: (data: Matrix<any>) => void;
  onCellCommit?: (prevCell, nextCell, coords) => void;
  onDataLoaded?: (data: Matrix<any>) => void;
}

const InputSheet = ({
  cells,
  hideAddButton = true,
  onChange,
  onCellCommit,
  onDataLoaded,
}: InputSheetProps) => {
  const [data, setData] = useState<Matrix<CellBase>>(cells);

  // useEffect(() => {
  //   console.log("run onDataLoaded");
  //   onDataLoaded(data);
  // }, [data, onDataLoaded])

  const change = data => {
    setData(data);
    onChange && onChange(data);
  };

  const cellCommit = (prevCell, nextCell, coords) => {
    onCellCommit(prevCell, nextCell, coords);
  };

  return (
    <>
      <Spreadsheet
        data={data}
        onChange={change}
        onCellCommit={onCellCommit && cellCommit}
      />
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
