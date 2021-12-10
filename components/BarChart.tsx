import { useState } from 'react';

// https://github.com/apexcharts/react-apexcharts/issues/240#issuecomment-765417887
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export interface ChartProps {
  series: SeriesProps[];
  yaxis?: ApexYAxis | ApexYAxis[];
}

export interface SeriesProps {
  name: string;
  data: DataPointProps[];
}

export interface DataPointProps {
  x: Date | number;
  y: number;
}

const BarChart = () => {
  const series = [
    {
      name: 'Eingang',
      data: [44, 55, 57, 56, 61, 58],
    },
    {
      name: 'Straße',
      data: [76, 85, 101, 98, 87, 105],
    },
    {
      name: 'Hof',
      data: [35, 41, 36, 26, 45, 48],
    },
    {
      name: 'Flur',
      data: [35, 41, 36, 26, 45, 48],
    },
    {
      name: 'Klingel',
      data: [35, 41, 36, 26, 45, 48],
    },
  ];
  const [options, setOptions] = useState<ApexCharts.ApexOptions>({
    chart: {
      id: 'apexchart-example',
      type: 'bar',
    },
    plotOptions: {
      bar: {
        // distributed: true,
        horizontal: false,
        columnWidth: '55%',
      },
    },
    xaxis: {
      categories: [
        '0 - 10 dB',
        '10 - 20 dB',
        '20 - 30 dB',
        '30 - 40 dB',
        '40 - 50 dB',
        '50 - 60 dB',
      ],
    },
    yaxis: {
      title: {
        text: 'Anzahl der Messungen',
      },
    },
    legend: {
      position: 'bottom',
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
  });

  return (
    <Chart
      options={options}
      series={series}
      type="bar"
      width={'100%'}
      height={320}
    />
  );
};

export default BarChart;
