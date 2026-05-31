import type { Station } from '@/lib/types/metro';

export async function fetchMetroStations(): Promise<Station[]> {
  const res = await fetch('/api/metro/stations');
  if (!res.ok) throw new Error(`fetchMetroStations: HTTP ${res.status}`);
  return res.json() as Promise<Station[]>;
}
