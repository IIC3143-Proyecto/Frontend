import metroData from '@/lib/msw/mocks/data/metro-stations.json';
import type { MetroLine } from '@/lib/types/metro';

export function useMetroStations() {
  return {
    lines: metroData.lines as MetroLine[],
    loading: false,
    error: null,
  };
}
