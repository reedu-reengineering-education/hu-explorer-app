import { ReactElement, useState } from 'react';
import useSWR from 'swr';
import { Feature, Point } from 'geojson';

// Own components
import Filter from '@/components/Filter';
import Map from '@/components/Map';
import Sidebar from '@/components/Sidebar';
import Stats from '@/components/Stats';
import CompareList from '@/components/CompareList';

// Own hooks
import useSharedCompareMode from '@/hooks/useCompareMode';

export default function Home() {
  const [selectedBox, setSelectedBox] = useState<Feature<Point>>();
  const [compareBoxes, setCompareBoxes] = useState<Feature<Point>[]>([]);
  const [project, setProject] = useState<string | undefined>(undefined);
  // const [dateFrom, setDateFrom] = useState<Date>();
  // const [dateTo, setDateTo] = useState<Date>();

  const [dateRange, setDateRange] = useState<Date[]>([null, null]);

  const { compare } = useSharedCompareMode();

  const { data, error } = useSWR<GeoJSON.FeatureCollection<Point>, any>(
    `${
      process.env.NEXT_PUBLIC_OSEM_API
    }/boxes?format=geojson&full=true&grouptag=HU Explorers${
      project ? ',' + project : ''
    }`,
  );

  const onBoxSelect = (box: Feature<Point>) => {
    // Check if Compare mode is active
    if (compare) {
      const isSelectedDevice =
        selectedBox.properties._id === box.properties._id;
      const alreadyInCompareDevices =
        compareBoxes.findIndex(
          device => device.properties._id === box.properties._id,
        ) !== -1;

      if (
        !isSelectedDevice &&
        !alreadyInCompareDevices &&
        compareBoxes.length < 5
      ) {
        setCompareBoxes([...compareBoxes, box]);
      }
    } else {
      setCompareBoxes([]);
      setSelectedBox(box);
    }
  };

  return (
    <main className="relative h-full w-full">
      <div className="h-full w-full">
        <Map data={data} onBoxSelect={box => onBoxSelect(box)} />
      </div>
      <div className="pointer-events-none absolute top-0 left-0 grid h-full w-full grid-cols-6 grid-rows-6 gap-6 p-8">
        <div className="pointer-events-auto col-span-3 row-start-1 h-fit md:col-span-2 lg:col-span-2 xl:col-span-1">
          <div className="flex h-full flex-col rounded-lg bg-white p-2 shadow">
            <Stats></Stats>
            <Filter
              setExpedition={setProject}
              dateRange={dateRange}
              setDateRange={setDateRange}
            ></Filter>
            {selectedBox ? (
              <CompareList
                devices={compareBoxes}
                setCompareBoxes={setCompareBoxes}
              />
            ) : null}
          </div>
        </div>

        {/* Sidebar / Bottombar */}
        <div className="pointer-events-auto col-start-1 col-end-7 row-span-2 row-start-5 overflow-hidden rounded-xl border-2">
          <Sidebar box={selectedBox} dateRange={dateRange} />
        </div>
      </div>
    </main>
  );
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};
