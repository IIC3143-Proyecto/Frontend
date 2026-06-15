"use client";

import { useNotifications } from "@/hooks/use-notifications";
import { NotificationCard } from "@/components/common/cards/notification-card";
import { Button } from "@/components/ui/button";
import { IconTrash } from "@tabler/icons-react";

export default function NotificationsPage() {
  const { notifications, isLoading, deleteOne, deleteAll } = useNotifications();

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
      <div className="flex flex-col gap-3">
        {notifications.length > 0 && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={deleteAll}
            >
              <IconTrash className="w-4 h-4 mr-1" />
              Borrar todas
            </Button>
          </div>
        )}
        {notifications.map((item) => (
          <div key={item.id} className="min-w-[400px]">
            <NotificationCard
              notification={item}
              onDelete={() => deleteOne(item.id)}
            />
          </div>
        ))}
      </div>

      {!isLoading && notifications.length === 0 && (
        <p className="text-muted-foreground text-sm text-center py-12">
          No tenés notificaciones
        </p>
      )}
    </div>
  );
}
