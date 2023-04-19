import { useState } from 'react';
import { Switch } from '@headlessui/react';

type ToggleProps = {
  label: string;
  onChange: (value: boolean) => void;
};

function Toggle({ label, onChange }: ToggleProps) {
  const [enabled, setEnabled] = useState(false);

  const toggled = () => {
    setEnabled(!enabled);
    onChange(!enabled);
  };

  return (
    <Switch.Group>
      <div className="flex items-center">
        <Switch
          checked={enabled}
          onChange={toggled}
          className={`${
            enabled ? 'bg-blue-600' : 'bg-gray-200'
          } relative inline-flex h-6 w-11 items-center rounded-full`}
        >
          <span className="sr-only">Enable notifications</span>
          <span
            className={`${
              enabled ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition`}
          />
        </Switch>
        <Switch.Label className="ml-2">{label}</Switch.Label>
      </div>
    </Switch.Group>
  );
}

export default Toggle;
