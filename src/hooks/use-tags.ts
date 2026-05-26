"use client";

import * as React from "react";

type TagCategories = Record<string, string[]>;

interface UseTagsReturn {
  categories: TagCategories;
  isLoading: boolean;
  error: string | null;
}

export function useTags(): UseTagsReturn {
  const [categories, setCategories] = React.useState<TagCategories>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/tags")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP error: ${r.status}`);
        return r.json();
      })
      .then((data: { categories: TagCategories }) => setCategories(data.categories))
      .catch((err: Error) => setError(err.message ?? "Error al cargar etiquetas"))
      .finally(() => setIsLoading(false));
  }, []);

  return { categories, isLoading, error };
}
