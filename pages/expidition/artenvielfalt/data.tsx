import React, { useState } from 'react';

import { useExpeditionParams } from '@/hooks/useExpeditionParams';
import InputSheet from '@/components/Artenvielfalt/InputSheet';
import { GetServerSideProps } from 'next';
import prisma from '@/lib/prisma';
import {
  ArtenvielfaltRecord,
  ArtRecord,
  VersiegelungRecord,
} from '@prisma/client';
import { TrendingUpIcon } from '@heroicons/react/outline';

import {
  ReactGrid,
  Column,
  Row,
  CellChange,
  TextCell,
  NumberCell,
  DefaultCellTypes,
} from '@silevis/reactgrid';
import '@silevis/reactgrid/styles.css';
import { Button } from '@/components/Elements/Button';
import { Router, useRouter } from 'next/dist/client/router';
import {
  ButtonCell,
  ButtonCellTemplate,
} from '@/components/ButtonCellTemplate';

const getColumns = (): Column[] => [
  { columnId: 'rowId', width: 150 },
  { columnId: 'art', width: 150 },
  { columnId: 'count', width: 150 },
  { columnId: 'actions', width: 150 },
];

const headerRow: Row = {
  rowId: 'header',
  cells: [
    { type: 'header', text: '' },
    { type: 'header', text: 'Art' },
    { type: 'header', text: 'Häufigkeit' },
    { type: 'header', text: 'Aktionen' },
  ],
};

const getRows = (arten: ArtRecord[]): Row<DefaultCellTypes | ButtonCell>[] => [
  headerRow,
  ...arten.map<Row<DefaultCellTypes | ButtonCell>>((art, idx) => ({
    rowId: art.id,
    cells: [
      { type: 'text', text: `${idx + 1}`, nonEditable: true },
      { type: 'text', text: art.art },
      { type: 'number', value: art.count },
      { type: 'button', text: 'Aktionen', action: 'DELETE' },
    ],
  })),
];

enum ExpeditionsArten {
  versiegelung = 'versiegelung',
  artenvielfalt = 'artenvielfalt',
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  // TODO: Check how we can secure endpoint

  const group = query.gruppe as string;
  const school = query.schule as string;

  const devices = await fetch(
    `${process.env.NEXT_PUBLIC_OSEM_API}/boxes?grouptag=HU Explorers,Artenvielfalt,${school}`,
  ).then(async response => {
    return await response.json();
  });

  const device = devices.filter(device => device.name === group);
  const today = new Date();

  // Find main group entries for data types
  const artenvielfalt = await prisma.artenvielfaltRecord.upsert({
    where: {
      deviceId_group_createdAt: {
        deviceId: device[0]._id,
        group: group,
        createdAt: today,
      },
    },
    update: {},
    create: {
      deviceId: device[0]._id,
      group: group,
    },
  });

  const versiegelung = await prisma.versiegelungRecord.findMany({
    where: {
      deviceId: device[0]._id,
      createdAt: today,
    },
  });

  const arten = await prisma.artRecord.findMany({
    where: {
      artenvielfaltId: artenvielfalt.id,
    },
    orderBy: {
      id: 'asc',
    },
  });

  return {
    props: { arten, device, artenvielfalt, versiegelung },
  };
};

type Props = {
  artenvielfalt: ArtenvielfaltRecord;
  arten: ArtRecord[];
  versiegelung: VersiegelungRecord[];
  device: any;
};

const Data = ({ device, artenvielfalt, arten, versiegelung }: Props) => {
  const { schule, gruppe, daten } = useExpeditionParams();
  const router = useRouter();

  // console.log(artenvielfalt);
  // console.log(arten);
  // console.log(versiegelung);
  // console.log(device);

  const [versiegelungsCells, setVersiegelungsCells] = useState([
    [
      {
        value: 'Undurchlässigkeit',
        readOnly: true,
        className: 'font-bold text-md',
      },
      { value: '', readOnly: true },
    ],
    [
      {
        value: 'Undurchlässigkeit in %',
        readOnly: true,
      },
      ...versiegelung?.map(entry => ({
        value: entry.value,
      })),
    ],
  ]);

  // Call this function whenever you want to
  // refresh props!
  const refreshData = () => {
    router.replace(router.asPath);
  };

  const calculateSimpsonIndex = () => {
    if (arten.length === 0) {
      return;
    }

    let numberOfOrganisms: number = 0;
    const numberOfSpecies = arten
      .map(art => {
        numberOfOrganisms = numberOfOrganisms + art.count;
        return art.count * (art.count - 1);
      })
      .reduce((prev, curr) => prev + curr);

    if (numberOfOrganisms === 0) {
      return;
    }

    const simpsonIndex: number =
      1 - numberOfSpecies / (numberOfOrganisms * (numberOfOrganisms - 1));
    console.log('Simpson Index (New Table)', simpsonIndex);

    return +simpsonIndex.toFixed(2);
  };

  const updateEntry = async (value, type, body) => {
    console.log(value, type);

    // TODO: build body
    try {
      await fetch(`/api/${type}`, {
        method: 'POST',
        body: body,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const cellCommit = (prevCell, nextCell, coords) => {
    console.log(prevCell, nextCell, coords);
    if (daten === ExpeditionsArten.versiegelung) {
      const payload = JSON.stringify({
        value: nextCell.value,
        group: gruppe,
        deviceId: device[0]._id,
      });
      updateEntry(nextCell, ExpeditionsArten.versiegelung, payload);
    }
  };

  let rows = getRows(arten);
  const columns = getColumns();

  const applyChangesToArten = (
    changes: CellChange<DefaultCellTypes | ButtonCell>[],
    prevArten: ArtRecord[],
  ): ArtRecord[] => {
    changes.forEach((change: CellChange<NumberCell>) => {
      const personIndex = change.rowId;
      const fieldName = change.columnId;

      const prevArt = prevArten.filter(art => art.id == personIndex);
      prevArt[0][fieldName] = change.newCell.value;
      prevArten = [...prevArten, prevArt[0]];
    });
    return [...prevArten];
  };

  const removeChangeFromArten = (
    changes: CellChange<DefaultCellTypes | ButtonCell>[],
    prevArten: ArtRecord[],
  ): ArtRecord[] => {
    changes.forEach((change: CellChange<NumberCell | ButtonCell>) => {
      const personIndex = change.rowId;

      const prevArt = prevArten.filter(art => art.id !== personIndex);
      prevArten = [...prevArt];
    });
    return [...prevArten];
  };

  const handleChanges = async (
    changes: CellChange<DefaultCellTypes | ButtonCell>[],
  ) => {
    let method = 'PUT';
    const payload = {
      id: changes[0].rowId,
      artenvielfaltId: artenvielfalt.id,
    };

    if (changes[0].type === 'text') {
      const change: CellChange<TextCell> = changes[0];
      payload['art'] = change.newCell.text;
    }

    if (changes[0].type === 'number') {
      const change: CellChange<NumberCell> = changes[0];
      payload['count'] = change.newCell.value;
      applyChangesToArten(changes, arten);
    }

    if (changes[0].type === 'button') {
      const change: CellChange<ButtonCell> = changes[0];
      arten = removeChangeFromArten(changes, arten);
      method = 'DELETE';
    }

    await fetch('/api/art', {
      method: method,
      body: JSON.stringify(payload),
    });

    const index = calculateSimpsonIndex();
    await fetch('/api/artenvielfalt', {
      method: 'PUT',
      body: JSON.stringify({
        id: artenvielfalt.id,
        simpsonIndex: index,
      }),
    });

    // Refresh to load new data from backend
    refreshData();
  };

  const addRow = async () => {
    // Create DB entry for new row in table
    const art: ArtRecord = await fetch('/api/art', {
      method: 'POST',
      body: JSON.stringify({
        art: '',
        count: 0,
        artenvielfaltId: artenvielfalt.id,
      }),
    }).then(response => {
      return response.json();
    });

    // Refresh to load new data from backend
    refreshData();
  };

  if (daten === 'versiegelung') {
    return <InputSheet cells={versiegelungsCells} onCellCommit={cellCommit} />;
  } else if (daten === 'artenvielfalt') {
    return (
      <>
        <div className="flex">
          <div className="flex flex-col">
            <ReactGrid
              rows={rows}
              columns={columns}
              onCellsChanged={handleChanges}
              customCellTemplates={{ button: new ButtonCellTemplate() }}
            />
            <Button onClick={addRow}>Art hinzufügen</Button>
          </div>
          <div className="flex flex-col-reverse m-3 pl-4">
            <div className="rounded-lg text-white shadow-lg bg-he-blue-light shadow-he-blue-light text-center aspect-square w-32 h-32 xl:w-48 xl:h-48 m-2">
              <div className="p-4 flex flex-col justify-between h-full">
                <span className="font-semibold text-xl">
                  Artenvielfalts-Index
                </span>
                <hr></hr>
                <div className="flex flex-col">
                  <span className="flex items-center justify-evenly">
                    <TrendingUpIcon className="h-5 w-5" />
                    <div>
                      <span className="text-3xl font-light">
                        {artenvielfalt.simpsonIndex}
                      </span>
                    </div>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-row h-full w-full overflow-hidden">
        <div className="flex flex-row flex-wrap max-w-[40%] overflow-hidden mr-2">
          Nothing found!
        </div>
      </div>
    </>
  );
};

export default Data;
