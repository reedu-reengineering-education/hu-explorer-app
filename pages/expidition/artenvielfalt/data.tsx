import React from 'react';

import { useExpeditionParams } from '@/hooks/useExpeditionParams';
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
import { useRouter } from 'next/dist/client/router';
import {
  ButtonCell,
  ButtonCellTemplate,
} from '@/components/ButtonCellTemplate';

const getColumns = (): Column[] => [
  { columnId: 'rowId', width: 50 },
  { columnId: 'art', width: 150 },
  { columnId: 'count', width: 150 },
  { columnId: 'actions', width: 150 },
];

const getColumnsVersieglung = (): Column[] => [
  { columnId: 'rowId', width: 150 },
  { columnId: 'count', width: 200 },
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

const headerRowVersieglung: Row = {
  rowId: 'header',
  cells: [
    { type: 'header', text: '' },
    { type: 'header', text: 'Versiegelungsanteil in %' },
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
      { type: 'button', text: 'Löschen', action: 'DELETE' },
    ],
  })),
];

const getRowsVersieglung = (
  versieglung: VersiegelungRecord,
): Row<DefaultCellTypes | ButtonCell>[] => [
  headerRowVersieglung,
  {
    rowId: versieglung.id,
    cells: [
      { type: 'text', text: '1', nonEditable: true },
      { type: 'number', value: versieglung.value },
    ],
  },
  // ...versieglung.map<Row<DefaultCellTypes | ButtonCell>>((art, idx) => ({
  //   rowId: art.id,
  //   cells: [
  //     { type: 'text', text: `${idx + 1}`, nonEditable: true },
  //     { type: 'number', value: art.value },
  //   ],
  // })),
];

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

  const errorCode = device.length === 0 ? 404 : false;

  if (errorCode) {
    return {
      props: { errorCode, message: 'Gruppe wurde nicht gefunden' },
    };
  }

  // Find main group entries for data types
  try {
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

    // Find versiegelungs record
    // If not existing, create record
    const versiegelung = await prisma.versiegelungRecord.upsert({
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
        value: 0,
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
      props: { errorCode, arten, device, artenvielfalt, versiegelung },
    };
  } catch (err) {
    return {
      props: { errorCode, message: err.message },
    };
  }
};

type Props = {
  artenvielfalt: ArtenvielfaltRecord;
  arten: ArtRecord[];
  versiegelung: VersiegelungRecord;
  device: any;
};

const Data = ({ device, artenvielfalt, arten, versiegelung }: Props) => {
  const { schule, gruppe, daten } = useExpeditionParams();
  const router = useRouter();

  // console.log(artenvielfalt);
  // console.log(arten);
  // console.log(versiegelung);
  // console.log(device);

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

  let rows = getRows(arten);
  let rowsVersiegelung = getRowsVersieglung(versiegelung);
  const columns = getColumns();
  const columnsVersieglung = getColumnsVersieglung();

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

  const handleChangeVersieglung = async (changes: CellChange<NumberCell>[]) => {
    const payload = {
      group: gruppe,
      deviceId: device[0]._id,
    };

    if (changes[0].type === 'number') {
      const change: CellChange<NumberCell> = changes[0];
      payload['value'] = change.newCell.value;
    }

    try {
      await fetch(`/api/versiegelung`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.log(error);
    }

    refreshData();
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
    return (
      <>
        <ReactGrid
          rows={rowsVersiegelung}
          columns={columnsVersieglung}
          onCellsChanged={handleChangeVersieglung}
        />
      </>
    );
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
            <Button variant="artenvielfalt" onClick={addRow}>
              Art hinzufügen
            </Button>
          </div>
          <div className="flex w-full justify-center">
            <div className="m-2 aspect-square h-48 w-48 rounded-lg bg-he-artenvielfalt text-center text-white shadow-lg shadow-he-artenvielfalt xl:h-48 xl:w-48">
              <div className="flex h-full flex-col justify-between p-4">
                <span className="text-xl font-semibold">
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
      <div className="flex h-full w-full flex-row overflow-hidden">
        <div className="mr-2 flex max-w-[40%] flex-row flex-wrap overflow-hidden">
          Nothing found!
        </div>
      </div>
    </>
  );
};

export default Data;
