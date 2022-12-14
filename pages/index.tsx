import { ReactElement, useEffect, useState } from 'react';
import useSWR from 'swr';
import { Feature, Point } from 'geojson';
import center from '@turf/center';
import { format, isAfter, isBefore } from 'date-fns';

// Own components
import Filter from '@/components/Filter';
import { default as MapboxMap } from '@/components/Map';
import Stats from '@/components/Stats';
import CompareList from '@/components/CompareList';

// Own hooks
import useSharedCompareMode from '@/hooks/useCompareMode';
import Schulstandort from '@/components/Sidebar/Schulstandort';
import { Device } from '@/types/osem';
import Messstation from '@/components/Sidebar/Messstation';
import Description from '@/components/Description';

export enum LayoutMode {
  MAP,
  DATA,
}

export default function Home() {
  const [selectedBox, setSelectedBox] = useState<Feature<Point, Device>>();

  const [compareBoxes, setCompareBoxes] = useState<Feature<Point>[]>([]);
  const [project, setProject] = useState<string | undefined>(undefined);
  const [rendering, setRendering] = useState<string>('schulstandort');

  const [layoutMode, setLayoutMode] = useState<LayoutMode>(LayoutMode.MAP);
  const [dateRange, setDateRange] = useState<Date[]>([null, null]);

  const { compare } = useSharedCompareMode();

  const { data, error } = useSWR<GeoJSON.FeatureCollection<Point>, any>(
    `${
      process.env.NEXT_PUBLIC_OSEM_API
    }/boxes?format=geojson&full=true&grouptag=HU Explorers${
      project ? ',' + project : ''
    }`,
  );
  const [transformedData, setTransformedData] = useState<
    GeoJSON.FeatureCollection<Point>
  >({
    type: 'FeatureCollection',
    features: [],
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    if (rendering === 'messstation') {
      setTransformedData(data);
      return;
    }

    let schoolFeatures = new Map<
      string,
      GeoJSON.FeatureCollection<Point, any>
    >();

    data.features.forEach(feature => {
      if (feature.properties.grouptag.length >= 3) {
        const grouptags = feature.properties.grouptag as string[];
        const schoolExpedition = `${grouptags[1]}-${
          grouptags[grouptags.length - 1]
        }`;
        if (schoolFeatures.has(schoolExpedition)) {
          schoolFeatures.get(schoolExpedition).features.push(feature);
        } else {
          const featureCollection: GeoJSON.FeatureCollection<Point, any> = {
            type: 'FeatureCollection',
            features: [feature],
          };
          schoolFeatures.set(schoolExpedition, featureCollection);
        }
      }
    });

    let transformedSchoolData: GeoJSON.FeatureCollection<Point> = {
      type: 'FeatureCollection',
      features: [],
    };

    schoolFeatures.forEach(schoolFeature => {
      const centeredFeature = center(schoolFeature);
      centeredFeature.properties = schoolFeature.features[0].properties;
      delete centeredFeature.properties.name;
      transformedSchoolData.features.push(centeredFeature);
    });
    setTransformedData(transformedSchoolData);

    return () => {};
  }, [data, dateRange, rendering]);

  const onBoxSelect = (box: Feature<Point, Device>) => {
    // Check if Compare mode is active
    if (compare) {
      const isSelectedDevice =
        selectedBox.properties._id === box.properties._id;
      const alreadyInCompareDevices =
        compareBoxes.findIndex(
          device => device.properties._id === box.properties._id,
        ) !== -1;

      if (
        !isSelectedDevice &&
        !alreadyInCompareDevices &&
        compareBoxes.length < 5
      ) {
        setCompareBoxes([...compareBoxes, box]);
      }
    } else {
      setCompareBoxes([]);
      setSelectedBox(box);
    }
  };

  const closeSidebar = () => {
    setSelectedBox(null);
    setLayoutMode(LayoutMode.MAP);
  };

  const switchLayout = () => {
    switch (layoutMode) {
      case LayoutMode.MAP:
        setLayoutMode(LayoutMode.DATA);
        break;
      case LayoutMode.DATA:
        setLayoutMode(LayoutMode.MAP);
        break;
      default:
        break;
    }
  };

  return (
    <main className="relative h-full w-full">
      <div className="h-full w-full">
        <MapboxMap
          data={transformedData}
          onBoxSelect={box => onBoxSelect(box)}
        />
      </div>
      {layoutMode === LayoutMode.MAP ? (
        <div className="pointer-events-none absolute top-0 left-0 grid h-full w-full grid-cols-6 grid-rows-6 gap-6 p-2">
          <div className="pointer-events-auto col-span-3 row-span-4 row-start-1 overflow-x-auto md:col-span-2 lg:col-span-2 xl:col-span-2">
            <div className="flex h-fit flex-col overflow-x-auto rounded-lg bg-white p-2 shadow">
              <Stats />
              <Description />
              <Filter
                setExpedition={setProject}
                dateRange={dateRange}
                setDateRange={setDateRange}
                setRendering={setRendering}
              ></Filter>
              {selectedBox ? (
                <CompareList
                  devices={compareBoxes}
                  setCompareBoxes={setCompareBoxes}
                />
              ) : null}
            </div>
          </div>

          {/* Sidebar / Bottombar */}
          {selectedBox ? (
            <div className="pointer-events-auto col-start-1 col-end-7 row-span-2 row-start-5 overflow-hidden rounded-xl border-2">
              <div className="absolute right-0 z-30 flex pt-1 pr-2 sm:pr-4">
                <button
                  type="button"
                  onClick={switchLayout}
                  className="rounded-md text-gray-300 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <span className="sr-only">Close panel</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={closeSidebar}
                  className="rounded-md text-gray-300 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <span className="sr-only">Close panel</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              {rendering === 'messstation' ? (
                <Messstation
                  layout={LayoutMode.MAP}
                  box={selectedBox}
                  rendering={rendering}
                  dateRange={dateRange}
                />
              ) : (
                <Schulstandort
                  layout={LayoutMode.MAP}
                  expedition={selectedBox?.properties?.tags[1]}
                  tag={
                    selectedBox?.properties?.tags[
                      selectedBox.properties.tags.length - 1
                    ]
                  }
                  box={selectedBox}
                  rendering={rendering}
                  dateRange={dateRange}
                />
              )}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="pointer-events-none absolute top-0 left-0 grid h-full w-full grid-cols-6 grid-rows-6 gap-6 p-2">
          <div className="pointer-events-auto col-span-3 row-span-6 row-start-1 overflow-x-auto md:col-span-2 lg:col-span-2 xl:col-span-2">
            <div className="flex h-full flex-col overflow-x-auto rounded-lg bg-white p-2 shadow">
              <Stats />
              <Description />
              <Filter
                setExpedition={setProject}
                dateRange={dateRange}
                setDateRange={setDateRange}
                setRendering={setRendering}
              ></Filter>
              {selectedBox ? (
                <CompareList
                  devices={compareBoxes}
                  setCompareBoxes={setCompareBoxes}
                />
              ) : null}
            </div>
          </div>

          {/* Sidebar / Bottombar */}
          {selectedBox ? (
            <div className="pointer-events-auto col-start-3 col-end-7 row-span-6 row-start-1 overflow-hidden rounded-xl border-2">
              <div className="absolute right-0 z-30 flex pt-1 pr-2 sm:pr-4">
                <button
                  type="button"
                  onClick={switchLayout}
                  className="rounded-md text-gray-300 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <span className="sr-only">Close panel</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={closeSidebar}
                  className="rounded-md text-gray-300 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <span className="sr-only">Close panel</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              {rendering === 'messstation' ? (
                <Messstation
                  layout={LayoutMode.DATA}
                  rendering={rendering}
                  box={selectedBox}
                  dateRange={dateRange}
                />
              ) : (
                <Schulstandort
                  layout={LayoutMode.DATA}
                  expedition={selectedBox?.properties?.tags[1]}
                  tag={
                    selectedBox?.properties?.tags[
                      selectedBox.properties.tags.length - 1
                    ]
                  }
                  box={selectedBox}
                  rendering={rendering}
                  dateRange={dateRange}
                />
              )}
            </div>
          ) : null}
        </div>
      )}
    </main>
  );
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};
