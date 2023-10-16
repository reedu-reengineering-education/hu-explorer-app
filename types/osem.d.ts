import { Feature, Point } from 'geojson';

export interface Measurement {
  value: string;
  createdAt: Date;
}

export interface Sensor {
  _id?: string;
  title: string;
  unit: string;
  sensorType: string;
  lastMeasurement?: Measurement;
  measurements?: any[];
  groups?: Measurement[];
}

export interface Location {
  lat: number;
  lng: number;
  height?: number;
}

export interface Device {
  _id?: string;
  name: string;
  exposure: string;
  createdAt?: Date;
  updatedAt?: Date;
  model?: string;
  grouptag: string[];
  tags?: string[];
  sensors: Sensor[];
  useAuth?: boolean;
  location: Location;
  sensorTemplates?: string;
  access_token?: string;
  transfer?: Transfer;
  lastMeasurementAt?: Date;
}

export interface CompareDevice {
  enabled: boolean;
  device: Feature<Point>;
  sensor: Sensor;
}
