import useSharedCompareMode from '@/hooks/useCompareMode';
import { Device } from '@/types/osem';
import { Disclosure } from '@headlessui/react';
import {
  ChevronUpIcon,
  ScaleIcon,
  XCircleIcon,
} from '@heroicons/react/outline';
import { Feature, Point } from 'geojson';
import { Button } from './Elements/Button';
import RadioGroupButton from './RadioGroup';

export interface CompareDevice {
  devices: Feature<Point>[];
  setCompareBoxes: React.Dispatch<React.SetStateAction<any>>;
}

const CompareList = ({ devices, setCompareBoxes }: CompareDevice) => {
  const { compare, setCompare } = useSharedCompareMode();

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
              <Disclosure.Panel className="h-full px-4 pt-2 pb-2 text-sm text-gray-500">
                <div className="flex justify-between">
                  <div className="flex flex-row items-center">
                    <label className="text-xs" htmlFor="compare">
                      Vergleichsmodus aktivieren
                    </label>
                    <input
                      className="ml-2"
                      type="checkbox"
                      name="compare"
                      onChange={handleCompare}
                      checked={compare}
                    />
                  </div>
                </div>
                {devices.length
                  ? devices.map(device => {
                      return (
                        <div
                          className="flex flex-col pt-2"
                          key={device.properties._id}
                        >
                          {/* <span>{device.properties.name}</span> */}
                          <div className="flex flex-row overflow-auto">
                            {device.properties.sensors.map((sensor, idx) => {
                              return (
                                <RadioGroupButton
                                  device={device}
                                  sensor={sensor}
                                  key={`${sensor._id}-${new Date()}`}
                                />
                              );
                            })}
                          </div>
                          <div className="mx-auto flex flex-row">
                            <Button
                              variant="danger"
                              className="w-full"
                              onClick={() => removeCompareDevice(device)}
                            >
                              <div className="inline-flex">
                                <XCircleIcon className="h-5 w-5" />
                                <span className="pl-2">Entfernen</span>
                              </div>
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  : compare && (
                      <div className="mt-2 flex justify-center">
                        <span className="text-center text-xs">
                          Keine Station zum Vergleichen ausgewählt!
                        </span>
                      </div>
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
