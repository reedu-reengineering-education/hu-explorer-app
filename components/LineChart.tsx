import { useEffect, useState } from 'react';

// https://github.com/apexcharts/react-apexcharts/issues/240#issuecomment-765417887
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export interface ChartProps {
  series: SeriesProps[];
  yaxis?: ApexYAxis | ApexYAxis[];
  colors?: ApexCharts.ApexOptions['colors'];
  customTools?: ApexChart['toolbar']['tools']['customIcons'];
}

export interface SeriesProps {
  name: string;
  data: DataPointProps[];
}

export interface DataPointProps {
  x: Date | number;
  y: number;
}

const LineChart = ({ series, yaxis, colors, customTools = [] }: ChartProps) => {
  const [options, setOptions] = useState<ApexCharts.ApexOptions>({
    chart: {
      id: 'sidebar-linechart',
      // defaultLocale: 'de',
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
          customIcons: customTools,
        },
      },
      redrawOnParentResize: true,
    },
    xaxis: {
      type: 'datetime',
    },
    yaxis,
    legend: {
      showForSingleSeries: true,
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

  useEffect(() => {
    setOptions({
      ...options,
      yaxis: yaxis,
      colors: colors,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors, yaxis]);

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
