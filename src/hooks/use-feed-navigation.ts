"use client";

import { useState, useCallback } from "react";
import { getAccessToken } from "@/actions/auth";
import { removeInteraction } from "@/lib/api/user";

type HistoryEntry = {
  postId: string;
  interaction: "Liked" | "Saved" | null;
};

export function useFeedNavigation() {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [cursor, setCursor] = useState(0);

  const advance = useCallback(
    (postId: string, interaction: "Liked" | "Saved" | null) => {
      setHistory((prev) => [...prev.slice(0, cursor), { postId, interaction }]);
      setCursor((prev) => prev + 1);
      setIndex((prev) => prev + 1);
    },
    [cursor],
  );

  const goBack = useCallback(async () => {
    if (cursor === 0) return;

    const entry = history[cursor - 1];

    if (entry?.interaction) {
      try {
        const token = await getAccessToken();
        await removeInteraction(entry.postId, entry.interaction, token);
      } catch {
        // El post sigue siendo visible aunque falle el rollback
      }
    }

    setCursor((prev) => Math.max(0, prev - 1));
    setIndex((prev) => Math.max(0, prev - 1));
  }, [cursor, history]);

  return {
    currentIndex: index,
    canGoBack: cursor > 0,
    history,
    advance,
    goBack,
  };
}
