import { useState, useEffect } from 'react';
import { Button } from './Elements/Button';

export type Tab = {
  title: string;
  component: JSX.Element;
  hypothesis?: string;
};

export interface TabProps {
  tabs: Tab[];
  onChange?: (tab: number) => void;
}

const Tabs = ({ tabs, onChange }: TabProps) => {
  const [tab, setTab] = useState(0);

  useEffect(() => {
    onChange(tab);
  }, [tab]);

  return (
    <>
      <div className="flex flex-wrap min-h-[25%] max-h-[25%] rounded-lg bg-gray-100">
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
      <div className="flex flex-col min-h-[75%] max-h-[75%] overflow-hidden">
        <div>
          {tabs[tab].hypothesis && (
            <h2 className="text-center my-4 font-semibold text-gray-800">
              &quot;{tabs[tab].hypothesis}&quot;
            </h2>
          )}
        </div>
        <div className="h-full overflow-auto">
          <div className="mt-4">{tabs[tab].component}</div>
        </div>
      </div>
    </>
  );
};

export default Tabs;
