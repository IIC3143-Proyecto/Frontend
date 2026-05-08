import * as React from 'react';

const CACHE_KEY = 'metro-stations';

type Station = { name: string; line: string };
type MetroLine = { number: string; stations: string[] };

export function useMetroStations() {
  const [lines, setLines] = React.useState<MetroLine[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      setLines(JSON.parse(cached));
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    fetch('/api/metro/stations')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then((stations: Station[]) => {
        const grouped = stations.reduce<Record<string, string[]>>((acc, { name, line }) => {
          if (!acc[line]) acc[line] = [];
          acc[line].push(name);
          return acc;
        }, {});

        const result = Object.entries(grouped).map(([number, stations]) => ({
          number,
          stations,
        }));

        localStorage.setItem(CACHE_KEY, JSON.stringify(result));
        setLines(result);
        setError(null);
      })
      .catch((err: Error) => {
        console.error('[Metro Hook] Error loading metro stations:', err);
        setError(err.message || 'Failed to load metro stations');
        setLines([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return { lines, loading, error };
}