import Map from '@/components/Map';
import { ReactElement, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import useSWR from 'swr';
import { Point } from 'geojson';

export default function Home() {
  const [selectedBox, setSelectedBox] = useState();

  // TODO: only fetch humboldt explorer devices
  // Wait for PR on Grouptag in openSenseMap API
  // fetch berlin data
  const { data, error } = useSWR<GeoJSON.FeatureCollection<Point>, any>(
    `${process.env.NEXT_PUBLIC_OSEM_API}/boxes?bbox=12.398393,52.030190,14.062822,52.883716&format=geojson&exposure=outdoor&full=true`,
  );

  return (
    <main className="relative h-full w-full">
      <div className="h-full w-full">
        <Map data={data} onBoxSelect={box => setSelectedBox(box)} />
      </div>
      <div className="pointer-events-none absolute top-0 left-0 grid h-full w-full grid-cols-6 grid-rows-6 gap-6 p-8">
        <div className="pointer-events-auto col-span-1 col-start-6 row-span-6 row-start-1">
          <Sidebar box={selectedBox}></Sidebar>
        </div>
      </div>
    </main>
  );
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};
