import { useEffect, useState } from 'react';

// https://github.com/apexcharts/react-apexcharts/issues/240#issuecomment-765417887
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export interface ChartProps {
  series: SeriesProps[];
  yaxis?: ApexYAxis | ApexYAxis[];
  colors?: ApexCharts.ApexOptions['colors'];
  switchChart?: () => void;
}

export interface SeriesProps {
  name: string;
  data: DataPointProps[];
}

export interface DataPointProps {
  x: Date | number;
  y: number;
}

const LineChart = ({ series, yaxis, colors, switchChart }: ChartProps) => {
  console.log(series);
  const [options, setOptions] = useState<ApexCharts.ApexOptions>({
    chart: {
      id: 'apexchart-example',
      animations: {
        enabled: false,
      },
      toolbar: {
        show: true,
        export: {
          csv: {
            dateFormatter(timestamp) {
              return timestamp;
            },
          },
        },
        tools: {
          customIcons: [
            {
              title: 'Balkendiagramm',
              class: 'custom-icon',
              index: 0,
              icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
</svg>`,
              click: switchChart,
            },
          ],
        },
      },
    },
    xaxis: {
      type: 'datetime',
    },
    yaxis,
    legend: {
      position: 'bottom',
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
    },
    tooltip: {
      shared: true,
      x: {
        format: 'dd.MM.yyyy HH:mm:ss',
      },
    },
    colors,
  });

  return (
    <Chart
      options={options}
      series={series}
      type="area"
      width={'100%'}
      height={'100%'}
    />
  );
};

export default LineChart;
