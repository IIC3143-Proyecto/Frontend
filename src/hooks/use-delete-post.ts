import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deletePost } from "@/lib/api/post";

type Options = {
  onSuccess?: (postId: string) => void;
};

export const useDeletePost = (options?: Options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Publicación eliminada");
      options?.onSuccess?.(postId);
    },
    onError: (err: Error) => {
      toast.error("Error al eliminar", { description: err.message });
    },
  });
};
