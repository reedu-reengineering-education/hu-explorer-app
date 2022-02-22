import * as React from 'react';
import {
  Cell,
  CellTemplate,
  Compatible,
  getCellProperty,
  Uncertain,
  UncertainCompatible,
} from '@silevis/reactgrid';
import { ReactNode } from 'react';

export interface ButtonCell extends Cell {
  type: 'button';
  text: string;
  action: string;
}

export class ButtonCellTemplate implements CellTemplate<ButtonCell> {
  getCompatibleCell(
    uncertainCell: Uncertain<ButtonCell>,
  ): Compatible<ButtonCell> {
    const text = getCellProperty(uncertainCell, 'text', 'string');
    const action = getCellProperty(uncertainCell, 'action', 'string');
    const value = parseFloat(text);
    return { ...uncertainCell, text, value, action };
  }
  update?(
    cell: Compatible<ButtonCell>,
    cellToMerge: UncertainCompatible<ButtonCell>,
  ): Compatible<ButtonCell> {
    return this.getCompatibleCell({
      ...cell,
      text: cellToMerge.text,
      action: cellToMerge.action,
    });
  }
  getClassName?(cell: Compatible<ButtonCell>, isInEditMode: boolean): string {
    return cell.className ? cell.className : '';
  }
  render(
    cell: Compatible<ButtonCell>,
    isInEditMode: boolean,
    onCellChanged: (cell: Compatible<ButtonCell>, commit: boolean) => void,
  ): ReactNode {
    return (
      <div className="mx-auto">
        <button
          className="py-2 px-4 bg-red-600 hover:bg-red-700 focus:ring-red-500 focus:ring-offset-indigo-200 text-white transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
          onClick={e =>
            onCellChanged(
              this.getCompatibleCell({ ...cell, text: e.currentTarget.value }),
              true,
            )
          }
        >
          {cell.text}
        </button>
      </div>
    );
  }
}
