import { useState } from 'react';

const ToggleSwitch = ({ onChange }) => {
  const [enabled, setEnabled] = useState(false);

  const toggled = () => {
    setEnabled(!enabled);
    onChange(!enabled);
  };

  return (
    <div>
      <input
        type="checkbox"
        className="toggle-switch-checkbox"
        checked={enabled}
        onChange={toggled}
      />
    </div>
  );
};

export default ToggleSwitch;
