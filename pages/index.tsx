import Map from '@/components/Map';
import { ReactElement, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import useSWR from 'swr';
import { Point } from 'geojson';
import Filter from '@/components/Filter';
import Stats from '@/components/Stats';
import useSharedCompareMode from '@/hooks/useCompareMode';

export default function Home() {
  const [selectedBox, setSelectedBox] = useState();
  const [project, setProject] = useState<string | undefined>(undefined);

  const { compare } = useSharedCompareMode();

  const { data, error } = useSWR<GeoJSON.FeatureCollection<Point>, any>(
    `${
      process.env.NEXT_PUBLIC_OSEM_API
    }/boxes?format=geojson&full=true&grouptag=HU Explorers${
      project ? ',' + project : ''
    }`,
  );

  const onBoxSelect = box => {
    console.log('COMPARE MODE: ', compare);

    if (compare) {
      // TODO: ADD box into compare array
    } else {
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
            <Filter setExpedition={setProject}></Filter>
          </div>
        </div>
        {/* <div className="pointer-events-auto col-span-1 col-start-6 row-span-6 row-start-1">
          <Sidebar box={selectedBox}></Sidebar>
        </div> */}
        <div className="pointer-events-auto col-start-1 col-end-7 row-span-2 row-start-5 overflow-hidden rounded-xl border-2">
          <Sidebar box={selectedBox}></Sidebar>
        </div>
      </div>
    </main>
  );
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};
