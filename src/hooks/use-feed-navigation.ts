"use client";

import { useState, useCallback, useRef } from "react";
import { getAccessToken } from "@/actions/auth";
import { removeInteraction } from "@/lib/api/user";

type HistoryEntry = {
  postId: string;
  interaction: "Liked" | "Saved" | null;
};

export function useFeedNavigation() {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const cursorRef = useRef(0); // ref sincrónico: evita stale closure en advance/goBack

  const advance = useCallback(
    (postId: string, interaction: "Liked" | "Saved" | null) => {
      const cursor = cursorRef.current;
      setHistory((prev) => [...prev.slice(0, cursor), { postId, interaction }]);
      cursorRef.current = cursor + 1;
      setIndex((prev) => prev + 1);
    },
    [],
  );

  const goBack = useCallback(async () => {
    if (cursorRef.current === 0) return;

    const cursor = cursorRef.current;
    setHistory((prev) => {
      const entry = prev[cursor - 1];
      if (entry?.interaction) {
        getAccessToken().then((token) =>
          removeInteraction(entry.postId, entry.interaction!, token)
        ).catch(() => {});
      }
      return prev;
    });

    cursorRef.current = Math.max(0, cursor - 1);
    setIndex((prev) => Math.max(0, prev - 1));
  }, []);

  return {
    currentIndex: index,
    canGoBack: index > 0,
    history,
    advance,
    goBack,
  };
}
