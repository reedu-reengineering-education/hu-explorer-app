import Map from '@/components/Map';
import { ReactElement } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <main className="relative h-full w-full">
      <div className="h-full w-full">
        <Map width="100%" height="100%" />
      </div>
      <div className="pointer-events-none absolute top-0 left-0 grid h-full w-full grid-cols-6 grid-rows-6 gap-8 p-8">
        <div className="pointer-events-auto col-span-5">
          <Navbar />
        </div>
        <div className="pointer-events-auto row-span-6">
          {/* <Sidebar></Sidebar> */}
        </div>
      </div>
      {/* <div className="absolute top-0 right-0 h-full p-8">
      </div> */}
    </main>
  );
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};
