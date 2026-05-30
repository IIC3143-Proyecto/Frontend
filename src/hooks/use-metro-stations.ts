import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

type Station = { name: string; line: string };
export type MetroLine = { number: string; stations: string[] };

function groupByLine(stations: Station[]): MetroLine[] {
  const grouped = stations.reduce<Record<string, string[]>>((acc, { name, line }) => {
    if (!acc[line]) acc[line] = [];
    acc[line].push(name);
    return acc;
  }, {});
  return Object.entries(grouped).map(([number, stations]) => ({ number, stations }));
}

export function useMetroStations() {
  const { data: lines = [], isLoading: loading, error } = useQuery<MetroLine[]>({
    queryKey: ['metro-stations'],
    queryFn: async () => {
      const res = await fetch(api.metroStations());
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const stations = await res.json() as Station[];
      return groupByLine(stations);
    },
    staleTime: Infinity, // metro station data never changes
  });

  return {
    lines,
    loading,
    error: error ? (error as Error).message : null,
  };
}
