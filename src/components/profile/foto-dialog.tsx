"use client";

import { useState } from "react";
import { IconCamera } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AvatarUpload } from "@/components/common/avatar-upload";
import { useUploadAvatar } from "@/hooks/use-patch-user";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  currentUrl?: string;
  sub: string;
};

export function FotoDialog({ open, onOpenChange, userId, currentUrl, sub }: Props) {
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const upload = useUploadAvatar();

  function handleClose() {
    if (upload.isPending) return;
    setPendingFile(null);
    onOpenChange(false);
  }

  function handleSave() {
    if (!pendingFile) return;
    upload.mutate(
      { userId, sub, file: pendingFile },
      {
        onSuccess: () => {
          setPendingFile(null);
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex flex-col gap-0 p-0">
        <DialogHeader className="border-b border-border px-4 pt-4 pb-3">
          <DialogTitle className="text-xs font-black uppercase flex items-center gap-1.5">
            <IconCamera className="size-3.5" /> Editar foto de perfil
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-center px-4 py-6">
          <AvatarUpload
            src={currentUrl}
            size="lg"
            onChange={setPendingFile}
            disabled={upload.isPending}
          />
        </div>

        <DialogFooter className="border-t border-border px-4 py-3">
          <Button variant="outline" onClick={handleClose} disabled={upload.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!pendingFile || upload.isPending}>
            {upload.isPending ? "Subiendo…" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
