import { Feature, Point } from 'geojson';
import { useEffect, useState } from 'react';

export interface CompareDevice {
  devices: Feature<Point>[];
  handleChange: (event: any) => void;
}

const CompareDevice = ({ devices, handleChange }: CompareDevice) => {
  const [checkedState, setCheckedState] = useState([]);
  console.log(checkedState);

  useEffect(() => {
    const newEntries = new Array(
      devices[devices.length - 1].properties.sensors.length,
    ).fill(false);

    setCheckedState([...checkedState, ...newEntries]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devices]);

  return (
    <div>
      {devices &&
        devices.map((device, index) => {
          return (
            <div className="flex flex-row" key={device.properties._id}>
              <span>{device.properties.name}</span>
              {device.properties.sensors.map((sensor, idx) => {
                console.log(sensor);
                return (
                  <div key={`${sensor._id}-${new Date()}`}>
                    <label htmlFor={`${sensor.title}-${sensor._id}`}>
                      {sensor.title}
                    </label>
                    <input
                      type="checkbox"
                      name={`${sensor.title}-${sensor._id}`}
                      id={`${device.properties._id}-${sensor._id}`}
                      value={checkedState[index + idx]}
                      onChange={handleChange}
                    />
                    <button>Löschen</button>
                  </div>
                );
              })}
            </div>
          );
        })}
    </div>
  );
};

export default CompareDevice;
