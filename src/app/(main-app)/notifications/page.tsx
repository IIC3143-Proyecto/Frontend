"use client";

import { useState } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationCard } from "@/components/common/cards/notification-card";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";
import { IconTrash } from "@tabler/icons-react";

type PendingDelete = { type: "one"; id: string } | { type: "all" };

export default function NotificationsPage() {
  const { notifications, isLoading, deleteOne, deleteAll } = useNotifications();
  const [pending, setPending] = useState<PendingDelete | null>(null);

  function handleConfirm() {
    if (!pending) return;
    if (pending.type === "one") deleteOne(pending.id);
    else deleteAll();
    setPending(null);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
      <div className="flex flex-col gap-3">
        {notifications.length > 0 && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setPending({ type: "all" })}
            >
              <IconTrash className="w-4 h-4 mr-1" />
              Borrar todas
            </Button>
          </div>
        )}
        {notifications.map((item) => (
          <div key={item.id} className="min-w-100">
            <NotificationCard
              notification={item}
              onDelete={() => setPending({ type: "one", id: item.id })}
            />
          </div>
        ))}
      </div>

      {!isLoading && notifications.length === 0 && (
        <p className="text-muted-foreground text-sm text-center py-12">
          No tienes notificaciones
        </p>
      )}

      <ConfirmDialog
        open={pending !== null}
        onClose={() => setPending(null)}
        onConfirm={handleConfirm}
        title={pending?.type === "all" ? "¿Borrar todas las notificaciones?" : "¿Eliminar notificación?"}
        description={
          pending?.type === "all"
            ? "Se eliminarán todas tus notificaciones. Esta acción no se puede deshacer."
            : "Se eliminará esta notificación. Esta acción no se puede deshacer."
        }
        confirmLabel="Eliminar"
        variant="destructive"
      />
    </div>
  );
}
