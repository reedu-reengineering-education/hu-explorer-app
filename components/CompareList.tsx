import useSharedCompareMode from '@/hooks/useCompareMode';
import { Device } from '@/types/osem';
import { Disclosure, RadioGroup } from '@headlessui/react';
import { ChevronUpIcon, ScaleIcon } from '@heroicons/react/outline';
import { Feature, Point } from 'geojson';
import { Button } from './Elements/Button';
import RadioGroupButton from './RadioGroup';

export interface CompareDevice {
  devices: Feature<Point>[];
  setCompareBoxes: React.Dispatch<React.SetStateAction<any>>;
}

const CompareList = ({ devices, setCompareBoxes }: CompareDevice) => {
  const { setCompare } = useSharedCompareMode();

  const handleCompare = event => {
    setCompare(event.target.checked);
  };

  const removeCompareDevice = (device: Feature<Point>) => {
    const deviceProps = device.properties as Device;
    setCompareBoxes(
      devices.filter(box => box.properties._id !== deviceProps._id),
    );
  };

  return (
    <div className="w-full pt-4">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white">
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between rounded-lg bg-purple-100 px-4 py-2 text-left text-sm font-medium text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
                <ScaleIcon className="h-5 w-5" />
                <span>Vergleichen ({devices.length} / 5)</span>
                <ChevronUpIcon
                  className={`${
                    open ? 'rotate-180 transform' : ''
                  } h-5 w-5 text-purple-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                <div>
                  <input
                    type="checkbox"
                    name="compare"
                    onChange={handleCompare}
                  />
                  <label htmlFor="compare">Aktivieren</label>
                </div>
                {devices.length ? (
                  devices.map(device => {
                    return (
                      <div
                        className="flex flex-row"
                        key={device.properties._id}
                      >
                        <span>{device.properties.name}</span>
                        {device.properties.sensors.map((sensor, idx) => {
                          return (
                            <RadioGroupButton
                              sensor={sensor}
                              key={`${sensor._id}-${new Date()}`}
                            />
                          );
                        })}
                        <Button onClick={() => removeCompareDevice(device)}>
                          Entfernen
                        </Button>
                      </div>
                    );
                  })
                ) : (
                  <span>Keine Station zum Vergleichen ausgewählt!</span>
                )}
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
    </div>
  );
};

export default CompareList;
