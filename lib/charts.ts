import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '@/tailwind.config.js';

const colors = resolveConfig(tailwindConfig).theme.colors;

export const generateChartOptions = (
  type,
  yAxis,
  categories,
  series,
): Highcharts.Options => {
  return {
    chart: {
      type: type,
    },
    title: {
      text: '',
    },
    xAxis: {
      categories: categories,
      crosshair: true,
    },
    legend: {
      enabled: false,
    },
    yAxis: [
      {
        title: {
          text: yAxis.text,
          style: {
            fontSize: '16px',
            color: colors.he[yAxis.value].DEFAULT,
          },
        },
        labels: {
          style: {
            color: colors.he[yAxis.value].DEFAULT,
          },
        },
        lineWidth: 2,
        lineColor: colors.he[yAxis.value].DEFAULT,
        max: 50,
      },
      {
        title: {
          text: 'Artenvielfaltsindex',
          style: {
            fontSize: '16px',
            color: colors.he.artenvielfalt.DEFAULT,
          },
        },
        labels: {
          style: {
            color: colors.he.artenvielfalt.DEFAULT,
          },
        },
        lineWidth: 2,
        lineColor: colors.he.artenvielfalt.DEFAULT,
        opposite: true,
        min: 0,
        max: 1,
      },
    ],
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
      },
    },
    series: series,
    colors: [colors.he[yAxis.value].DEFAULT, colors.he.artenvielfalt.DEFAULT],
  };
};
