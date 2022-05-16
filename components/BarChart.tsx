import { useEffect, useState } from 'react';

// https://github.com/apexcharts/react-apexcharts/issues/240#issuecomment-765417887
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export interface ChartProps {
  series: SeriesProps[];
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis | ApexYAxis[];
  colors?: ApexCharts.ApexOptions['colors'];
  customTools?: ApexChart['toolbar']['tools']['customIcons'];
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
  customTools = [],
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
          customIcons: customTools,
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
    xaxis: xaxis,
    yaxis: yaxis,
    colors: colors,
    legend: {
      position: 'bottom',
      fontSize: '14px',
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
      xaxis: xaxis,
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
