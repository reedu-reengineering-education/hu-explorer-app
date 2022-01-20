import React, { useState } from 'react';

import { useExpeditionParams } from '@/hooks/useExpeditionParams';
import InputSheet from '@/components/Artenvielfalt/InputSheet';
import { Matrix } from 'react-spreadsheet';
import Tile from '@/components/Tile';
import { GetServerSideProps } from 'next';
import prisma from '@/lib/prisma';
import { ArtenvielfaltRecord, VersiegelungRecord } from '@prisma/client';
import { TrendingUpIcon, VariableIcon } from '@heroicons/react/outline';

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  // TODO: Check how we can secure endpoint

  const group = query.gruppe as string;
  const school = query.schule as string;

  const records = await prisma.artenvielfaltRecord.findMany({});
  const versiegelung = await prisma.versiegelungRecord.findMany({
    where: {
      group,
    },
  });

  return {
    props: { records, versiegelung },
  };
};

type Props = {
  records: ArtenvielfaltRecord[];
  versiegelung: VersiegelungRecord[];
};

const Data = ({ records, versiegelung }: Props) => {
  const { schule, gruppe, daten } = useExpeditionParams();
  // const [data, setData] = useState(records);

  const [versiegelungsCells, setVersiegelungsCells] = useState([
    [
      { value: 'Versiegelung', readOnly: true, className: 'font-bold text-md' },
      { value: '', readOnly: true },
    ],
    [
      {
        value: 'Versiegelungsgrad in %',
        readOnly: true,
      },
      ...versiegelung?.map(entry => ({
        value: entry.value,
      })),
    ],
  ]);
  const [artenvielfaltsCells, setArtenvielfaltsCells] = useState([
    [
      {
        value: 'Artenvielfalt',
        readOnly: true,
        className: 'font-bold text-md',
      },
      { value: '' },
    ],
    [
      {
        value: 'Artname',
        readOnly: true,
      },
      { value: 'Häufigkeit', readOnly: true },
    ],
    ...records.map(record => {
      return [{ value: record.art }, { value: record.count }];
    }),
    [{ value: '' }, { value: '' }],
    [{ value: '' }, { value: '' }],
    [{ value: '' }, { value: '' }],
  ]);

  const [simpsonIndex, setSimpsonIndex] = useState<number>(0);

  const changedData = (data: Matrix<any>) => {
    const matrix = [...data];
    const speciesData = matrix.slice(2);
    let numberOfOrganisms = 0;
    const numberOfSpecies = speciesData
      .flat()
      .filter((_, i) => i % 2 === 1)
      .map(value => {
        // Check if value is a number
        if (isNaN(parseInt(value.value))) return 0;

        numberOfOrganisms = numberOfOrganisms + parseInt(value.value);
        return parseInt(value.value) * (parseInt(value.value) - 1);
      })
      .reduce((prev, curr) => prev + curr);
    const simpsonIndex: number =
      1 - numberOfSpecies / (numberOfOrganisms * (numberOfOrganisms - 1));
    console.log('Simpson Index', simpsonIndex);

    if (!Number.isNaN(simpsonIndex)) {
      setSimpsonIndex(+simpsonIndex.toFixed(2));
    }
  };

  const updateEntry = async value => {
    console.log(value);
    try {
      await fetch('/api/versiegelung', {
        method: 'POST',
        body: JSON.stringify({
          value: value.value,
          group: gruppe,
        }),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const cellCommit = (prevCell, nextCell, coords) => {
    console.log(prevCell, nextCell, coords);
    if (daten === 'versiegelung') {
      updateEntry(nextCell);
    } else if (daten === 'artenvielfalt') {
    }
  };

  if (daten === 'versiegelung') {
    return <InputSheet cells={versiegelungsCells} onCellCommit={cellCommit} />;
  } else if (daten === 'artenvielfalt') {
    return (
      <>
        <div className="flex">
          <div className="flex flex-col">
            <InputSheet
              cells={artenvielfaltsCells}
              hideAddButton={false}
              onChange={changedData}
              onCellCommit={cellCommit}
              onDataLoaded={changedData}
            />
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
                        {simpsonIndex}
                      </span>
                    </div>
                  </span>
                  {/* <span className="flex items-center justify-evenly">
                    <VolumeUpIcon className="h-5 w-5" />
                    <div>
                      <span className="text-3xl font-light">{max ?? '-'}</span> dB
                    </div>
                  </span> */}
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
