// https://github.com/apexcharts/react-apexcharts/issues/240#issuecomment-765417887
import dynamic from 'next/dynamic';
import { useState } from 'react';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export interface PieChartProps {
  series: number[];
  labels: string[];
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis | ApexYAxis[];
  colors?: ApexCharts.ApexOptions['colors'];
  customTools?: ApexChart['toolbar']['tools']['customIcons'];
}

const PieChart = ({ series, labels }: PieChartProps) => {
  const [options, setOptions] = useState<ApexCharts.ApexOptions>({
    labels: labels,
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
    noData: {
      text: 'Keine Daten',
    },
  });

  return (
    <Chart
      options={options}
      series={series}
      type="pie"
      width={'100%'}
      height={'100%'}
    />
  );
};

export default PieChart;
