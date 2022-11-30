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
            color: colors['he'][yAxis.value].DEFAULT,
          },
        },
        labels: {
          style: {
            color: colors['he'][yAxis.value].DEFAULT,
          },
        },
        lineWidth: 2,
        lineColor: colors['he'][yAxis.value].DEFAULT,
        max: 50,
      },
      {
        title: {
          text: 'Artenvilfaltsindex',
          style: {
            fontSize: '16px',
            color: colors['he'].artenvielfalt.DEFAULT,
          },
        },
        labels: {
          style: {
            color: colors['he'].artenvielfalt.DEFAULT,
          },
        },
        lineWidth: 2,
        lineColor: colors['he'].artenvielfalt.DEFAULT,
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
    colors: [
      colors['he'][yAxis.value].DEFAULT,
      colors['he'].artenvielfalt.DEFAULT,
    ],
  };
};

export const defaultChartOptions: Highcharts.Options = {
  title: {
    text: '',
  },
  chart: {
    zooming: {
      type: 'x',
    },
  },
  plotOptions: {
    series: {
      marker: {
        enabled: false,
        symbol: 'circle',
      },
      lineWidth: 4,
    },
  },
  yAxis: [],
  xAxis: {
    type: 'datetime',
    dateTimeLabelFormats: {
      millisecond: '%H:%M:%S.%L',
      second: '%H:%M:%S',
      minute: '%H:%M',
      hour: '%H:%M',
      day: '%e. %b',
      week: '%e. %b',
      month: "%b '%y",
      year: '%Y',
    },
  },
  legend: {
    align: 'center',
    verticalAlign: 'bottom',
    layout: 'horizontal',
  },
  credits: {
    enabled: true,
  },
  time: {
    useUTC: false,
    timezoneOffset: new Date().getTimezoneOffset(),
  },
  tooltip: {
    dateTimeLabelFormats: {
      day: '%d.%m.%Y %H:%M:%S',
    },
  },
  colors: [],
  series: [],
};

export const defaultBarChartOptions: Highcharts.Options = {
  title: {
    text: '',
  },
  chart: {
    type: 'column',
  },
  xAxis: {
    categories: [
      '0 - 19 dB',
      '20 - 39 dB',
      '40 - 59 dB',
      '60 - 79 dB',
      '80 - 99 dB',
      '100 - 119 dB',
      '120 - 139 dB',
      'über 139 dB',
    ],
    crosshair: true,
  },
  yAxis: {
    title: {
      text: 'Anzahl der Messungen',
    },
  },
  legend: {
    align: 'center',
    verticalAlign: 'bottom',
    layout: 'horizontal',
  },
  credits: {
    enabled: true,
  },
  plotOptions: {
    column: {
      pointPadding: 0.2,
      borderWidth: 0,
    },
  },
};

export const defaultPieChartOptions: Highcharts.Options = {
  chart: {
    plotBackgroundColor: null,
    plotBorderWidth: null,
    plotShadow: false,
    type: 'pie',
  },
  title: {
    text: '',
  },
  tooltip: {
    pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>',
  },
  accessibility: {
    point: {
      valueSuffix: '%',
    },
  },
  plotOptions: {
    pie: {
      allowPointSelect: true,
      cursor: 'pointer',
      dataLabels: {
        enabled: true,
        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
      },
    },
  },
  series: [],
};
