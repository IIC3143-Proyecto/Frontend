import { useMemo } from 'react';
import metroData from '@/lib/msw/mocks/data/metro-stations.json';
import type { MetroLine } from '@/lib/types/metro';

export function useMetroStations(): MetroLine[] {
  return metroData.lines as MetroLine[];
}

export function useStationNameMap(): Map<string, string> {
  const lines = useMetroStations();
  return useMemo(() => {
    const map = new Map<string, string>();
    lines.forEach(l => l.stations.forEach(st => map.set(st.id, st.name)));
    return map;
  }, [lines]);
}
