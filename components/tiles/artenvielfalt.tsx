import React from 'react';
import MeasurementTile, { ChartType } from '../MeasurementTile';
import { Sensor } from '@/types/osem';
import { ArtenvielfaltRecord } from '@prisma/client';

export interface ArtenvielfaltTileDataProps {
  aggregations: ArtenvielfaltRecord[];
  lastMeasurement: ArtenvielfaltRecord;
  measurements: ArtenvielfaltRecord[];
  grouped: ArtenvielfaltRecord[];
}

export interface ArtenvielfaltProps {
  data: ArtenvielfaltTileDataProps;
  openChart: (chartType: ChartType, sensor: Sensor) => void;
  charts: ChartType[];
}

export default function Artenvielfalt({
  data,
  openChart,
  charts,
}: ArtenvielfaltProps) {
  const sensor: Sensor = {
    title: 'Simpson-Index',
    unit: '',
    sensorType: '',
    ...(data.aggregations !== undefined &&
    data.aggregations['_avg'] !== undefined &&
    data.aggregations['_avg'].simpsonIndex !== null
      ? {
          lastMeasurement: {
            value: data.aggregations['_avg'].simpsonIndex.toFixed(2),
            createdAt: data.measurements[0].updatedAt,
          },
        }
      : {}),
    measurements: data.measurements,
    groups: data.grouped.map(group => ({
      value: group['_avg'].simpsonIndex.toFixed(2),
      createdAt: group.createdAt,
    })),
  };
  return (
    <MeasurementTile sensor={sensor} openChart={openChart} charts={charts} />
  );
}
