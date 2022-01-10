import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '@/tailwind.config.js';

export const useTailwindColors = () => {
  const fullConfig = resolveConfig(tailwindConfig);

  return fullConfig.theme.colors;
};
