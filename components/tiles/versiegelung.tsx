import React from 'react';
import MeasurementTile, { ChartType } from '../MeasurementTile';
import { Sensor } from '@/types/osem';
import { VersiegelungRecord } from '@prisma/client';

export interface VersiegelungTileDataProps {
  aggregations: VersiegelungRecord[];
  lastMeasurement: VersiegelungRecord;
  measurements: VersiegelungRecord[];
  grouped: VersiegelungRecord[];
}

export interface VersiegelungProps {
  data: VersiegelungTileDataProps;
  openChart: (chartType: ChartType, sensor: Sensor) => void;
  charts: ChartType[];
}

export default function Versiegelung({
  data,
  openChart,
  charts,
}: VersiegelungProps) {
  const sensor: Sensor = {
    title: 'Versiegelung',
    unit: '%',
    sensorType: '',
    ...(data.aggregations !== undefined &&
    data.aggregations['_avg'] !== undefined &&
    data.aggregations['_avg'].value !== null
      ? {
          lastMeasurement: {
            value: data.aggregations['_avg'].value.toFixed(2),
            createdAt: data.measurements[0].updatedAt,
          },
        }
      : {}),
    measurements: data.measurements,
    groups: data.grouped.map(group => ({
      value: group['_avg'].value.toFixed(2),
      createdAt: group.createdAt,
    })),
  };

  return (
    <MeasurementTile sensor={sensor} openChart={openChart} charts={charts} />
  );
}
