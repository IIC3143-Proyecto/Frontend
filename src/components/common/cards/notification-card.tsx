import {
  IconSettings,
  IconUserPlus,
  IconUserCheck,
  IconTag,
  IconArticle,
  IconBuildingStore,
  type Icon,
} from "@tabler/icons-react";
import type { NotificationDto, NotificationType } from "@/lib/types/notification";
import { cn, formatRelativeDate } from "@/lib/utils";

// ─── shared helpers ──────────────────────────────────────────────────────────

type TypeConfig = {
  Icon: Icon;
  colorClass: string;   // text color
  bgClass: string;      // background color
  borderClass: string;  // border / accent color
  label: string;
};

const TYPE_CONFIG: Record<NotificationType, TypeConfig> = {
  Sistema:      { Icon: IconSettings,      colorClass: "text-foreground", bgClass: "bg-muted", borderClass: "border-foreground", label: "Sistema" },
  Seguidores:   { Icon: IconUserPlus,      colorClass: "text-foreground", bgClass: "bg-muted", borderClass: "border-foreground", label: "Seguidores" },
  Siguiendo:    { Icon: IconUserCheck,     colorClass: "text-foreground", bgClass: "bg-muted", borderClass: "border-foreground", label: "Siguiendo" },
  Ofertas:      { Icon: IconTag,           colorClass: "text-foreground", bgClass: "bg-muted", borderClass: "border-foreground", label: "Ofertas" },
  Publicaciones:{ Icon: IconArticle,       colorClass: "text-foreground", bgClass: "bg-muted", borderClass: "border-foreground", label: "Publicaciones" },
  Vendedor:     { Icon: IconBuildingStore, colorClass: "text-foreground", bgClass: "bg-muted", borderClass: "border-foreground", label: "Vendedor" },
};


// ─── V1: Minimalista — borde izquierdo de color, sin icono ───────────────────

export function NotificationCardV1({ notification: n }: { notification: NotificationDto }) {
  const cfg = TYPE_CONFIG[n.type];
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl pl-4 pr-4 py-3 flex flex-col gap-1",
        "border-l-4",
        cfg.borderClass,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn("text-xs font-medium uppercase tracking-wide", cfg.colorClass)}>
          {cfg.label}
        </span>
        <span className="text-xs text-muted-foreground">{formatRelativeDate(n.createdAtUtcMinus3)}</span>
      </div>
      <p className="text-sm font-semibold leading-snug">{n.title}</p>
      <p className="text-sm text-muted-foreground leading-snug">{n.content}</p>
    </div>
  );
}

// ─── V2: Icono grande en círculo coloreado ────────────────────────────────────

export function NotificationCardV2({ notification: n }: { notification: NotificationDto }) {
  const { Icon, colorClass, bgClass } = TYPE_CONFIG[n.type];
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex gap-3">
      <div className={cn("w-14 h-14 rounded-full flex items-center justify-center shrink-0", bgClass)}>
        <Icon className={cn("w-8 h-8", colorClass)} />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug">{n.title}</p>
        <p className="text-sm text-muted-foreground leading-snug">{n.content}</p>
        <span className="text-xs text-muted-foreground mt-1">{formatRelativeDate(n.createdAtUtcMinus3)}</span>
      </div>
    </div>
  );
}

// ─── V3: Avatar del usuario + badge pill del tipo ─────────────────────────────

export function NotificationCardV3({ notification: n }: { notification: NotificationDto }) {
  const { Icon, colorClass, bgClass, label } = TYPE_CONFIG[n.type];
  const initials = n.targetUser.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex gap-3">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-semibold text-muted-foreground">
        {initials}
      </div>
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1", bgClass, colorClass)}>
            <Icon className="w-3 h-3" />
            {label}
          </span>
        </div>
        <p className="text-sm font-semibold leading-snug">{n.title}</p>
        <p className="text-sm text-muted-foreground leading-snug">{n.content}</p>
        <span className="text-xs text-muted-foreground">{formatRelativeDate(n.createdAtUtcMinus3)}</span>
      </div>
    </div>
  );
}

// ─── V4: Banda top de color + icono e título en la misma fila ─────────────────

export function NotificationCardV4({ notification: n }: { notification: NotificationDto }) {
  const { Icon, colorClass, bgClass, borderClass, label } = TYPE_CONFIG[n.type];
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className={cn("h-1.5 w-full", bgClass, borderClass, "border-t-4 border-x-0 border-b-0")} />
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon className={cn("w-4 h-4", colorClass)} />
            <span className={cn("text-xs font-semibold", colorClass)}>{label}</span>
          </div>
          <span className="text-xs text-muted-foreground">{formatRelativeDate(n.createdAtUtcMinus3)}</span>
        </div>
        <p className="text-sm font-semibold leading-snug">{n.title}</p>
        <p className="text-sm text-muted-foreground leading-snug">{n.content}</p>
      </div>
    </div>
  );
}

// ─── V5: Compacta tipo row de lista ───────────────────────────────────────────

export function NotificationCardV5({ notification: n }: { notification: NotificationDto }) {
  const { Icon, colorClass, bgClass } = TYPE_CONFIG[n.type];
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", bgClass)}>
        <Icon className={cn("w-4 h-4", colorClass)} />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <p className="text-sm font-semibold truncate">{n.title}</p>
        <p className="text-xs text-muted-foreground truncate">{n.content}</p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{formatRelativeDate(n.createdAtUtcMinus3)}</span>
    </div>
  );
}

// ─── V6: Elevada con sombra, punto de leído prominente ───────────────────────

export function NotificationCardV6({ notification: n }: { notification: NotificationDto }) {
  const { Icon, colorClass, bgClass, label } = TYPE_CONFIG[n.type];
  return (
    <div
      className="bg-card rounded-2xl shadow-md p-4 flex gap-3"
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", bgClass)}>
        <Icon className={cn("w-5 h-5", colorClass)} />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className={cn("text-xs font-medium", colorClass)}>{label}</span>
        </div>
        <p className="text-sm font-semibold leading-snug">{n.title}</p>
        <p className="text-sm text-muted-foreground leading-snug">{n.content}</p>
        <span className="text-xs text-muted-foreground mt-1">{formatRelativeDate(n.createdAtUtcMinus3)}</span>
      </div>
    </div>
  );
}
