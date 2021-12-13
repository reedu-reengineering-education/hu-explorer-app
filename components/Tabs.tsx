import { useState } from 'react';
import { Button } from './Elements/Button';

export type Tab = {
  title: string;
  component: JSX.Element;
  hypothesis?: string;
};

export interface TabProps {
  tabs: Tab[];
}

const Tabs = ({ tabs }: TabProps) => {
  const [tab, setTab] = useState(0);

  return (
    <>
      <div className="flex justify-around rounded-lg bg-gray-100 p-2">
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
      <div className="w-full overflow-auto">
        {tabs[tab].hypothesis && (
          <h2 className="text-center my-4 font-semibold text-gray-800">
            &quot;{tabs[tab].hypothesis}&quot;
          </h2>
        )}
        <div className="mt-4">{tabs[tab].component}</div>
      </div>
    </>
  );
};

export default Tabs;
