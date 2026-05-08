import * as React from 'react';

const CACHE_KEY = 'metro-stations';

type Station = { name: string; line: string };
type MetroLine = { number: string; stations: string[] };

export function useMetroStations() {
  const [lines, setLines] = React.useState<MetroLine[]>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // Empieza en true solo si no hay caché — así nunca llamamos setLoading(true) en el effect
  const [loading, setLoading] = React.useState<boolean>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return !cached;
    } catch {
      return true;
    }
  });

  const [error, setError] = React.useState<string | null>(null);
  const hasFetched = React.useRef(false);

  React.useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    try {
      if (localStorage.getItem(CACHE_KEY)) return;
    } catch {
      // si localStorage falla, igual intentamos el fetch
    }

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
        const result = Object.entries(grouped).map(([number, stations]) => ({ number, stations }));
        localStorage.setItem(CACHE_KEY, JSON.stringify(result));
        setLines(result);
      })
      .catch((err: Error) => {
        console.error('[Metro Hook] Error loading metro stations:', err);
        setError(err.message || 'Failed to load metro stations');
      })
      .finally(() => setLoading(false));
  }, []);

  return { lines, loading, error };
}