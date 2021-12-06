import { useLerneinheitParams } from '@/hooks/useLerneinheitParams';

const Schall = () => {
  const { schule } = useLerneinheitParams();

  return (
    <div className="flex flex-col">
      <div className="p-4">
        <h1 className="text-4xl">Schall</h1>
        <div className="font-semibold text-gray-500">{schule}</div>
      </div>
      <div className="flex flex-col sm:flex-row divide-x-2 divide-blue-500">
        <div className="flex-grow md:w-2/3 p-4">Tabelle</div>
        <div className="flex-none md:w-1/3 p-4">Auswertung</div>
      </div>
    </div>
  );
};

export default Schall;
