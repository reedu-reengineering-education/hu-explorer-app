import { useEffect, useState } from 'react';

// https://github.com/apexcharts/react-apexcharts/issues/240#issuecomment-765417887
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export interface ChartProps {
  series: SeriesProps[];
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis | ApexYAxis[];
  colors?: ApexCharts.ApexOptions['colors'];
  switchChart?: () => void;
}

export interface SeriesProps {
  name: string;
  data: DataPointProps[] | number[];
}

export interface DataPointProps {
  x: Date | number;
  y: number;
}

const BarChart = ({
  series,
  xaxis,
  yaxis,
  colors,
  switchChart,
}: ChartProps) => {
  const [options, setOptions] = useState<ApexCharts.ApexOptions>({
    chart: {
      id: 'apexchart-example',
      animations: {
        enabled: false,
      },
      toolbar: {
        show: true,
        tools: {
          customIcons: [
            {
              title: 'Liniendiagramm',
              class: 'custom-icon',
              index: 0,
              icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
</svg>`,
              click: switchChart,
            },
          ],
        },
      },
    },
    plotOptions: {
      bar: {
        // distributed: true,
        horizontal: false,
        columnWidth: '55%',
      },
    },
    xaxis,
    yaxis: yaxis,
    colors: colors,
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

  useEffect(() => {
    setOptions({
      ...options,
      xaxis,
      yaxis: yaxis,
      colors: colors,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors, yaxis, xaxis]);

  return (
    <Chart
      options={options}
      series={series}
      type="bar"
      width={'100%'}
      height={'100%'}
    />
  );
};

export default BarChart;
