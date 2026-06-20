import {
  IconSettings,
  IconUserPlus,
  IconUserCheck,
  IconTag,
  IconArticle,
  IconBuildingStore,
  IconTrash,
  type Icon,
} from "@tabler/icons-react";
import type { NotificationDto, NotificationType } from "@/lib/types/notification";
import { formatRelativeDate } from "@/lib/utils";
import { MiniRoundButton } from "@/components/common/mini-round-button";

const TYPE_ICON: Record<NotificationType, Icon> = {
  Sistema:       IconSettings,
  Seguidores:    IconUserPlus,
  Siguiendo:     IconUserCheck,
  Ofertas:       IconTag,
  Publicaciones: IconArticle,
  Vendedor:      IconBuildingStore,
};

export function NotificationCard({
  notification: n,
  onDelete,
}: {
  notification: NotificationDto;
  onDelete?: () => void;
}) {
  const Icon = TYPE_ICON[n.type] ?? IconSettings;
  return (
    <div data-testid="notification-card" className="relative bg-card border border-border rounded-xl p-4 flex gap-3">
      <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 bg-muted">
        <Icon className="w-8 h-8 text-foreground" />
      </div>
      <div className="flex flex-col gap-0.5 flex-1 overflow-hidden">
        <p className="text-sm font-semibold leading-snug">{n.title}</p>
        <p className="text-sm text-muted-foreground leading-snug">{n.content}</p>
        <span className="text-xs text-muted-foreground mt-1">{formatRelativeDate(n.createdAtUtcMinus3)}</span>
      </div>
      {onDelete && (
        <MiniRoundButton
          className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onDelete}
          title="Eliminar"
        >
          <IconTrash className="w-4 h-4" />
        </MiniRoundButton>
      )}
    </div>
  );
}
