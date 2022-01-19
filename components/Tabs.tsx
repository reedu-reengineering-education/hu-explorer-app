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

enum variants {
  primary = 'primary',
  inverse = 'inverse',
  danger = 'danger',
  temperatur = 'temperatur',
  bodenfeuchte = 'bodenfeuchte',
  versiegelung = 'versiegelung',
}

const Tabs = ({ tabs, onChange }: TabProps) => {
  const [tab, setTab] = useState(0);

  useEffect(() => {
    onChange(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <div className="flex flex-col">
      <div className="flex rounded-lg bg-gray-100">
        {tabs.map((t, i) => (
          <Button
            onClick={() => setTab(i)}
            variant={variants[t.title.toLowerCase()]}
            key={`artenvielfalt_tab_${i}`}
            className="w-full text-center"
          >
            {t.title}
          </Button>
        ))}
      </div>
      <div className="flex flex-row w-full min-h-[75%] max-h-[75%] overflow-hidden">
        <div className="w-full">
          {tabs[tab].hypothesis && (
            <h2 className="text-center my-4 font-semibold text-gray-800">
              &quot;{tabs[tab].hypothesis}&quot;
            </h2>
          )}
        </div>
        {/* <div className="h-full overflow-auto">
          <div className="mt-4">{tabs[tab].component}</div>
        </div> */}
      </div>
    </div>
  );
};

export default Tabs;
