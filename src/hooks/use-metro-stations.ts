import * as React from 'react';

const CACHE_KEY = 'metro-stations';

type Station = { name: string; line: string };
type MetroLine = { number: string; stations: string[] };

function isValidCache(data: unknown): data is MetroLine[] {
  return (
    Array.isArray(data) &&
    data.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.number === 'string' &&
        Array.isArray(item.stations) &&
        item.stations.every((s: unknown) => typeof s === 'string')
    )
  );
}

export function useMetroStations() {
  const [lines, setLines] = React.useState<MetroLine[]>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (isValidCache(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [loading, setLoading] = React.useState<boolean>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (isValidCache(parsed)) return false;
      }
    } catch {}
    return true;
  });

  const [error, setError] = React.useState<string | null>(null);
  const hasFetched = React.useRef(false);

  React.useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (isValidCache(parsed)) {
          setLines(parsed);
          setLoading(false);
          return;
        }
      }
    } catch {}

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
        
        setLines(result);
        
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(result));
        } catch (err) {
          console.warn('[Metro Hook] Failed to cache stations:', err);
        }
      })
      .catch((err: Error) => {
        console.error('[Metro Hook] Error loading metro stations:', err);
        setError(err.message || 'Failed to load metro stations');
      })
      .finally(() => setLoading(false));
  }, []);

  return { lines, loading, error };
}