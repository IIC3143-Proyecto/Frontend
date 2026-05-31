import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PostDto as Post } from "@/lib/types/post";

type Props = {
  open: boolean;
  onClose: () => void;
  post: Post;
};

export function PostEditModal({ open, onClose, post }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar publicación</DialogTitle>
        </DialogHeader>
        {/* formulario aquí */}
      </DialogContent>
    </Dialog>
  );
}
