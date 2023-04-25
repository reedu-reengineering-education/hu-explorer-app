import { useState } from 'react';

const ToggleSwitch = ({ label, checked, onChange }) => {
  const toggled = () => {
    onChange();
  };

  return (
    <div className="ml-2">
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={toggled}
          className="peer sr-only"
        />
        <div className="peer-focus:purple-blue-300 dark:bg-pruple-700 peer h-6 w-11 rounded-full bg-purple-200 after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-purple-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-purple-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 dark:border-purple-600 dark:peer-focus:ring-purple-800"></div>
        <span className="text-black-900 ml-3 text-sm font-medium">{label}</span>
      </label>
    </div>
  );
};

export default ToggleSwitch;
