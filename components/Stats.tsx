import useSWR from 'swr';

const Stats = () => {
  const { data, error } = useSWR<any, any>(
    `${process.env.NEXT_PUBLIC_OSEM_API}/stats`,
  );

  return (
    <div className="flex w-full justify-evenly divide-x-2 px-4 py-2">
      <div className="flex w-full flex-col justify-center px-4 text-center">
        <span className="text-xl font-bold text-he-violet">
          {data && data[0]}
        </span>
        <span className="text-sm text-gray-500">Geräte</span>
      </div>
      <div className="flex w-full flex-col justify-center px-4 text-center">
        <span className="text-xl font-bold text-he-violet">
          {data && data[1]}
        </span>
        <span className="text-sm text-gray-500">Messungen</span>
      </div>
    </div>
  );
};

export default Stats;
