import React, { useState } from 'react';

import { useExpeditionParams } from '@/hooks/useExpeditionParams';
import { Button } from '@/components/Elements/Button';
import InputSheet from '@/components/Artenvielfalt/InputSheet';
import OsemSheet from '@/components/Artenvielfalt/OsemSheet';
import LineChart from '@/components/LineChart';

const tabs = [
  {
    title: 'Artenvielfalt',
    component: <InputSheet />,
  },
  {
    title: 'Messwerte',
    component: <OsemSheet />,
  },
];

const Artenvielfalt = () => {
  const { schule, gruppe } = useExpeditionParams();
  const [tab, setTab] = useState(0);

  return (
    <div className="flex flex-col">
      <div className="p-4">
        <h1 className="text-4xl">Artenvielfalt</h1>
        <div className="font-semibold text-gray-500">Schule: {schule}</div>
        <div className="font-semibold text-gray-500">Gruppe: {gruppe}</div>
      </div>
      <div className="flex flex-col sm:flex-row divide-x-2 divide-blue-500">
        <div className="flex-grow md:w-2/3 p-4">
          <div className="flex justify-around rounded-lg bg-gray-100 p-2 mb-2">
            {tabs.map((t, i) => (
              <Button
                onClick={() => setTab(i)}
                variant={tab === i ? 'primary' : 'inverse'}
                key={`artenvielfalt_tab_${i}`}
                className="w-full text-center"
              >
                {t.title}
              </Button>
            ))}
          </div>
          <div className="w-full text-center">{tabs[tab].component}</div>
        </div>
        <div className="flex-none md:w-1/3 p-4">
          <h2 className="text-xl">Auswertung</h2>
          <LineChart></LineChart>
        </div>
      </div>
    </div>
  );
};

export default Artenvielfalt;
