import { Fragment, forwardRef, useState } from 'react';
import { Disclosure, Listbox, Transition } from '@headlessui/react';
import {
  ChevronUpIcon,
  FilterIcon,
  CheckIcon,
  SelectorIcon,
} from '@heroicons/react/outline';
import DatePicker from 'react-datepicker';

const expedition = [
  { name: 'Alle', value: undefined },
  { name: 'Schallpegel', value: 'Schallpegel' },
  { name: 'Artenvielfalt', value: 'Artenvielfalt' },
];

const presentation = [
  { name: 'Messstation', value: 'messstation' },
  { name: 'Schulstandort', value: 'schulstandort' },
];

export interface FilterProps {
  setExpedition: (e) => void;
  dateRange: Date[];
  setDateRange: (e) => void;
  setRendering: (e) => void;
}

const Filter = ({
  setExpedition,
  setRendering,
  dateRange,
  setDateRange,
}: FilterProps) => {
  // Lerneinheit
  const [selected, setSelected] = useState(expedition[0]);
  const [rendered, setRendered] = useState(presentation[0]);

  const onChange = e => {
    setSelected(e);
    setExpedition(e.value);
  };

  const onRenderChange = e => {
    setRendered(e);
    setRendering(e.value);
  };

  // Datum
  const [startDate, endDate] = dateRange;

  const ReactDatePickerInput = forwardRef<
    HTMLInputElement,
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >
  >((props, ref) => (
    <button
      className="group inline-flex items-center rounded-md bg-orange-700 px-3 py-2 text-base font-medium text-white hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
      onClick={props.onClick}
      ref={ref}
    >
      {props.value}
      <ChevronUpIcon
        className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 `}
      />
    </button>
  ));

  ReactDatePickerInput.displayName = 'ReactDatePickerInput';

  return (
    <div className="w-full pt-4">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white">
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between rounded-lg bg-purple-100 px-4 py-2 text-left text-sm font-medium text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
                <FilterIcon className="h-5 w-5" />
                <span>Filter</span>
                <ChevronUpIcon
                  className={`${
                    open ? 'rotate-180 transform' : ''
                  } h-5 w-5 text-purple-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                <div className="w-full">
                  <Listbox value={selected} onChange={onChange}>
                    <div className="relative mt-1">
                      <Listbox.Label>Lerneinheit:</Listbox.Label>
                      <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                        <span className="block truncate">{selected.name}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <SelectorIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {expedition.map((person, personIdx) => (
                            <Listbox.Option
                              key={personIdx}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'text-gray-900'
                                }`
                              }
                              value={person}
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={`block truncate ${
                                      selected ? 'font-medium' : 'font-normal'
                                    }`}
                                  >
                                    {person.name}
                                  </span>
                                  {selected ? (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                      <CheckIcon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                      />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                </div>
                <div className="w-full">
                  <Listbox value={rendered} onChange={onRenderChange}>
                    <div className="relative mt-1">
                      <Listbox.Label>Darstellung:</Listbox.Label>
                      <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                        <span className="block truncate">{rendered.name}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <SelectorIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {presentation.map((person, personIdx) => (
                            <Listbox.Option
                              key={personIdx}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'text-gray-900'
                                }`
                              }
                              value={person}
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={`block truncate ${
                                      selected ? 'font-medium' : 'font-normal'
                                    }`}
                                  >
                                    {person.name}
                                  </span>
                                  {selected ? (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                      <CheckIcon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                      />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                </div>
                <div className="flex w-full py-2">
                  <DatePicker
                    dateFormat="dd/MM/yyyy"
                    nextMonthButtonLabel=">"
                    previousMonthButtonLabel="<"
                    selectsRange={true}
                    startDate={startDate}
                    endDate={endDate}
                    maxDate={new Date()}
                    onChange={update => {
                      setDateRange(update);
                    }}
                    customInput={<ReactDatePickerInput />}
                  />
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
    </div>
  );
};

export default Filter;
