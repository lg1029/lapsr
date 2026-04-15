import { useWindowDimensions } from 'react-native';

export const MAX_CONTENT_WIDTH = 640;

export function useIsTablet(): boolean {
  const { width } = useWindowDimensions();
  return width >= 768;
}
