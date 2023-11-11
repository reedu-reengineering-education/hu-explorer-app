import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { DateTime } from 'luxon';
// import LineChart from './LineChart';
// import BarChart from './BarChart';

export interface ModalProps {
  open: boolean;
  onClose: (open: boolean) => void;
}

const startDateTime = DateTime.local()
  .setLocale('de')
  .minus({ hours: 12 })
  .toUTC();

const generateData = (range: number) => {
  return Array.from({ length: 72 }, (_, i) => {
    return {
      y: Math.floor(Math.random() * range) + 1,
      x: startDateTime
        .plus({ minutes: 10 * i })
        .toUTC()
        .setLocale('de')
        .toString(),
    };
  });
};

export default function MyModal({ open, onClose }: ModalProps) {
  const series = [
    {
      name: 'Temperatur',
      data: generateData(10),
    },
  ];

  const series2 = [
    {
      name: 'Bodenfeuchte',
      data: generateData(100),
    },
  ];

  const yaxis = {
    title: {
      text: 'Temperatur in °C',
    },
  };

  const yaxis2 = {
    title: {
      text: 'Bodenfeuchte in %',
    },
  };

  return (
    <>
      <Transition appear show={open} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => onClose(false)}
        >
          <div className="flex min-h-screen items-center justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="my-8 inline-block h-full w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Payment successful
                </Dialog.Title>
                <div className="mt-2 w-full">
                  {/* <LineChart series={series} yaxis={yaxis} /> */}
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={() => onClose(false)}
                  >
                    Got it, thanks!
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
