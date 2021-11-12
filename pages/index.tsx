import Map from '@/components/Map';
import { ReactElement } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <main className="relative w-full h-full">
      <div className="w-full h-full">
        <Map width="100%" height="100%" />
      </div>
      <div className="absolute top-0 left-0 h-full w-full p-8 grid grid-cols-6 grid-rows-6 gap-8 pointer-events-none">
        <div className="col-span-5 pointer-events-auto">
          <Navbar />
        </div>
        <div className="row-span-6 pointer-events-auto">
          <Sidebar></Sidebar>
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
