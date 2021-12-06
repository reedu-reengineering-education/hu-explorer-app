import LineChart from '@/components/LineChart';
import Map from '@/components/Map';
import OsemSheet from '@/components/Schall/OsemSheet';
import { useExpeditionParams } from '@/hooks/useExpeditionParams';

const Schall = () => {
  const { schule, gruppe } = useExpeditionParams();

  return (
    <div className="flex flex-col">
      <div className="p-4">
        <h1 className="text-4xl">Schall</h1>
        <div className="font-semibold text-gray-500">Schule: {schule}</div>
        <div className="font-semibold text-gray-500">Gruppe: {gruppe}</div>
      </div>
      <div className="flex flex-col sm:flex-row divide-x-2 divide-blue-500">
        <div className="flex-grow md:w-2/3 p-4">
          <OsemSheet></OsemSheet>
        </div>
        <div className="flex-none md:w-1/3 p-4">
          <div className="rounded-xl overflow-hidden shadow mb-4">
            <Map width="100%" height={200} />
          </div>
          <h2 className="text-xl">Auswertung</h2>
          <LineChart />
        </div>
      </div>
    </div>
  );
};

export default Schall;
