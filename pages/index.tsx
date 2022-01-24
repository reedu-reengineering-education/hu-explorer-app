import Map from '@/components/Map';
import { ReactElement, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

export default function Home() {
  const [selectedBox, setSelectedBox] = useState();
  return (
    <main className="relative w-full h-full">
      <div className="w-full h-full">
        <Map
          width="100%"
          height="100%"
          onBoxSelect={box => setSelectedBox(box)}
        />
      </div>
      <div className="absolute top-0 left-0 h-full w-full p-8 grid grid-cols-6 grid-rows-6 gap-6 pointer-events-none">
        <div className="row-span-6 col-start-6 row-start-1 col-span-1 pointer-events-auto">
          <Sidebar box={selectedBox}></Sidebar>
        </div>
      </div>
    </main>
  );
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};
