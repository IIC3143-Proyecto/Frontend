import metroData from '@/lib/msw/mocks/data/metro-stations.json';
import type { MetroLine } from '@/lib/types/metro';


export function useMetroStations(): MetroLine[] {
  return metroData.lines as MetroLine[];
}
