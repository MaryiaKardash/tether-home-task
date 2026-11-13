import { useColorScheme } from 'react-native';

const light = {
  background: '#f2f2f7',
  card: '#ffffff',
  text: '#111111',
  muted: '#6b6b70',
  accent: '#009393',
  danger: '#e5484d',
};

const dark: typeof light = {
  background: '#000000',
  card: '#1c1c1e',
  text: '#f2f2f7',
  muted: '#9a9aa0',
  accent: '#30c9c9',
  danger: '#ff6369',
};

export type Colors = typeof light;

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}
