import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon, InformationCircleIcon } from '@heroicons/react/outline';

const Description = () => {
  return (
    <div className="w-full pt-4">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white">
        <Disclosure defaultOpen>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between rounded-lg bg-purple-100 px-4 py-2 text-left text-sm font-medium text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
                <InformationCircleIcon className="h-5 w-5" />
                <span>Anleitung</span>
                <ChevronUpIcon
                  className={`${
                    open ? 'rotate-180 transform' : ''
                  } h-5 w-5 text-purple-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                <div className="w-full">
                  <p>
                    Wählt per Klick auf die Karte einen Schulstandort aus und
                    ihr seht Messwerte von Umweltfaktoren an dieser Schule.
                  </p>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
    </div>
  );
};

export default Description;
