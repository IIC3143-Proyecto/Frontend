import metroData from '@/lib/msw/mocks/data/metro-stations.json';
import type { MetroLine } from '@/lib/types/metro';

// TODO backend [PR #80]: el endpoint GET /api/station no será usado desde el frontend.
// Las estaciones se manejan con datos locales.
export function useMetroStations(): MetroLine[] {
  return metroData.lines as MetroLine[];
}
