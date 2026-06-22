// hooks/use-post-save-state.tsx
"use client";

import { useState } from "react";
import { useCreateInteraction, useRemoveInteraction } from "./use-interaction";

export function usePostSaveState(postId: string | null) {
  const [state, setState] = useState<{ postId: string | null; isSaved: boolean }>({
    postId,
    isSaved: false,
  });

  if (state.postId !== postId) {
    setState({ postId, isSaved: false });
  }

  const createInteraction = useCreateInteraction();
  const removeInteraction = useRemoveInteraction();

  const toggleSave = () => {
    if (!postId) return;
    const next = !state.isSaved;
    setState({ postId, isSaved: next });

    const mutation = next ? createInteraction : removeInteraction;
    mutation.mutate(
      { postId, type: "Saved" },
      { onError: () => setState({ postId, isSaved: !next }) }
    );
  };

  return {
    isSaved: state.isSaved,
    toggleSave,
    isSavePending: createInteraction.isPending || removeInteraction.isPending,
  };
}