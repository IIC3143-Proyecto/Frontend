"use client";

import * as React from "react";

type TagCategories = Record<string, string[]>;

interface UseTagsReturn {
  categories: TagCategories;
  isLoading: boolean;
  error: string | null;
}

const CACHE_KEY = 'tags-categories';

function isValidCache(data: unknown): data is TagCategories {
  return (
    typeof data === 'object' &&
    data !== null &&
    Object.values(data).every(
      (v) => Array.isArray(v) && v.every((s) => typeof s === 'string')
    )
  );
}

export function useTags(): UseTagsReturn {
  const [categories, setCategories] = React.useState<TagCategories>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (isValidCache(parsed)) return parsed;
      }
    } catch {}
    return {};
  });

  const [isLoading, setIsLoading] = React.useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached && isValidCache(JSON.parse(cached))) return false;
    } catch {}
    return true;
  });

  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isLoading) return;
    fetch('/tags')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP error: ${r.status}`);
        return r.json();
      })
      .then((data: { categories: TagCategories }) => {
        setCategories(data.categories);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data.categories));
        } catch {}
      })
      .catch((err: Error) => setError(err.message ?? 'Error al cargar etiquetas'))
      .finally(() => setIsLoading(false));
  }, [isLoading]);

  return { categories, isLoading, error };
}
