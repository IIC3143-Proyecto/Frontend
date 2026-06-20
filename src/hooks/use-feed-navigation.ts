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

  const advance = useCallback(
    (postId: string, interaction: "Liked" | "Saved" | null) => {
      setHistory((prev) => [...prev, { postId, interaction }]);
      setIndex((prev) => prev + 1);
    },
    [],
  );

  const goBack = useCallback(async () => {
    if (history.length === 0) return;

    const last = history[history.length - 1];

    if (last.interaction) {
      try {
        const token = await getAccessToken();
        await removeInteraction(last.postId, last.interaction, token);
      } catch {
        // El post sigue siendo visible aunque falle el rollback
      }
    }

    setHistory((prev) => prev.slice(0, -1));
    setIndex((prev) => Math.max(0, prev - 1));
  }, [history]);

  return {
    currentIndex: index,
    canGoBack: history.length > 0,
    history,
    advance,
    goBack,
  };
}
