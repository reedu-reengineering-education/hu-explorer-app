import Map from '@/components/Map';
import { ReactElement, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import useSWR from 'swr';
import { Point } from 'geojson';
import Filter from '@/components/Filter';

export default function Home() {
  const [selectedBox, setSelectedBox] = useState();
  const [project, setProject] = useState<string | undefined>(undefined);

  // TODO: only fetch humboldt explorer devices
  // Wait for PR on Grouptag in openSenseMap API
  // fetch berlin data
  const { data, error } = useSWR<GeoJSON.FeatureCollection<Point>, any>(
    `${
      process.env.NEXT_PUBLIC_OSEM_API
    }/boxes?format=geojson&full=true&grouptag=HU Explorers${
      project ? ',' + project : ''
    }`,
  );

  const onChange = e => {
    if (e.target.value === 'undefined') {
      setProject(undefined);
    } else {
      setProject(e.target.value);
    }
  };

  return (
    <main className="relative h-full w-full">
      {/* <select name="project" id="project" onChange={onChange} value={project}>
        <option value="undefined">Alle</option>
        <option value="Schallpegel">Schallpegel</option>
        <option value="Artenvielfalt">Artenvielfalt</option>
      </select> */}
      <div className="h-full w-full">
        <Map data={data} onBoxSelect={box => setSelectedBox(box)} />
      </div>
      <div className="pointer-events-none absolute top-0 left-0 grid h-full w-full grid-cols-6 grid-rows-6 gap-6 p-8">
        <div className="pointer-events-auto col-span-1 row-start-1 h-fit">
          <div className="flex h-full flex-col rounded-lg bg-white p-2 shadow">
            <span>Geräte 16</span>
            <span>Messungen 1000</span>
            <Filter setExpedition={setProject}></Filter>
          </div>
        </div>
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
