"use client";

import { useState } from "react";
import {
  IconBrandInstagram,
  IconDeviceMobile,
  IconMail,
  IconMapPin,
  IconBookmark,
  IconAlertTriangle,
  IconCamera,
  IconSparkles,
  IconLogout,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { UserDto } from "@/lib/types/user";
import type { PostDto } from "@/lib/types/post";
import { groupTagPreferencesByCategory } from "@/lib/tag-utils";
import { ContactDialog } from "./contact-dialog";
import { MetroDialog } from "./metro-dialog";
import { SavedSheet } from "./saved-sheet";
import { PhotoDialog } from "./photo-dialog";
import { useUserTagPreferences } from "@/hooks/use-user-tag-preferences";
import { useStationNameMap } from "@/hooks/use-metro-stations";
import { useSellerRating } from "@/hooks/use-seller-rating";

type Props = {
  user: UserDto;
  savedPosts: PostDto[];
  sub: string;
  isOwner?: boolean;
};

export function ProfileLayout({
  user,
  savedPosts,
  sub,
  isOwner = true,
}: Props) {
  const [contactOpen, setContactOpen] = useState(false);
  const [metroOpen, setMetroOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);

  const { data: tagPrefs = [] } = useUserTagPreferences(user.id);
  const { data: rating } = useSellerRating(user.id);

  const stationNameMap = useStationNameMap();

  const prefsByCategory = groupTagPreferencesByCategory(tagPrefs);
  const hasPrefs = Object.keys(prefsByCategory).length > 0;
  const hasContact =
    user.contactInfo?.instagram ??
    user.contactInfo?.whatsapp ??
    user.contactInfo?.email;

  return (
    <div>
      <header className="bg-sidebar border-b border-border p-6 sm:p-8 sm:px-12.5 flex flex-col items-center gap-3 text-center">
        <div
          className={`relative group ${isOwner ? "cursor-pointer" : ""}`}
          onClick={isOwner ? () => setPhotoOpen(true) : undefined}
        >
          <Avatar className="size-20">
            <AvatarImage src={user.photoUrl} alt={user.username} />
            <AvatarFallback>
              {(user.name || user.username || "?")[0]}
            </AvatarFallback>
          </Avatar>
          {isOwner && (
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <IconCamera className="size-5 text-white" />
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-wide">
            @{user.username}
          </p>
          {rating && rating.timesRated > 0 && (
            <div className="flex items-center justify-center gap-1 mt-1">
              {Array.from({ length: 5 }, (_, i) =>
                i < Math.round(rating.score) ? (
                  <IconStarFilled key={i} className="size-3.5 text-yellow-400" />
                ) : (
                  <IconStar key={i} className="size-3.5 text-muted-foreground" />
                )
              )}
              <span className="text-xs text-muted-foreground ml-1">
                {rating.score.toFixed(1)}
              </span>
            </div>
          )}
          {user.bio && (
            <p className="text-sm mt-2 max-w-xs leading-relaxed">{user.bio}</p>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-4 p-4 max-w-sm mx-auto sm:max-w-none sm:grid sm:grid-cols-2 sm:gap-3 sm:px-12.5 sm:py-4">
        <section className="bg-card border border-border rounded-2xl p-4 sm:p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase flex items-center gap-1.5 text-muted-foreground">
              <IconMapPin className="size-3.5" /> Zona
            </p>
            {isOwner && (
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMetroOpen(true)}
              >
                Editar
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {user.stations && user.stations.length > 0 ? (
              user.stations.map((id) => (
                <span
                  key={id}
                  className="text-xs bg-muted px-1.5 py-0.5 rounded-full border border-border leading-tight"
                >
                  {stationNameMap.get(id) ?? id}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">
                Sin zona definida
              </span>
            )}
          </div>
        </section>

        <section className="bg-card border border-border rounded-2xl p-4 sm:p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase flex items-center gap-1.5 text-muted-foreground">
              Contacto
            </p>
            {isOwner && (
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setContactOpen(true)}
              >
                Editar
              </button>
            )}
          </div>
          <div className="flex flex-col gap-1 text-xs">
            {user.contactInfo?.instagram && (
              <div className="flex items-center gap-1.5">
                <IconBrandInstagram className="size-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{user.contactInfo.instagram}</span>
              </div>
            )}
            {user.contactInfo?.whatsapp && (
              <div className="flex items-center gap-1.5">
                <IconDeviceMobile className="size-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{user.contactInfo.whatsapp}</span>
              </div>
            )}
            {user.contactInfo?.email && (
              <div className="flex items-center gap-1.5">
                <IconMail className="size-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{user.contactInfo.email}</span>
              </div>
            )}
            {!hasContact && (
              <span className="text-muted-foreground">
                Sin información de contacto
              </span>
            )}
          </div>
        </section>

        <section className="bg-card border border-border rounded-2xl p-4 sm:p-3 sm:col-span-2 flex flex-col gap-2">
          <p className="text-xs font-black uppercase flex items-center gap-1.5 text-muted-foreground">
            <IconSparkles className="size-3.5" /> Preferencias
          </p>
          {hasPrefs ? (
            <div className="flex flex-col gap-2">
              {Object.entries(prefsByCategory).map(([cat, tags]) => (
                <div key={cat} className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground/60 w-24 shrink-0">
                    {cat}
                  </span>
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs bg-muted px-1.5 py-0.5 rounded-full border border-border leading-tight"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Sin preferencias registradas todavía.
            </p>
          )}
        </section>

        {isOwner && (
          <>
            <section className="bg-card border border-border rounded-2xl p-4 sm:p-3 sm:col-span-2 flex items-center justify-between">
              <p className="text-xs font-black uppercase flex items-center gap-1.5 text-muted-foreground">
                <IconBookmark className="size-3.5" /> Guardados (
                {savedPosts.length})
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSavedOpen(true)}
              >
                Ver guardados
              </Button>
            </section>

            <section className="bg-card border border-border rounded-2xl p-4 sm:p-3 sm:col-span-2 flex items-center justify-between">
              <p className="text-xs font-black uppercase flex items-center gap-1.5 text-muted-foreground">
                <IconLogout className="size-3.5" /> Cerrar sesión
              </p>
              <Button size="sm" variant="outline" asChild>
                <a href="/logout">Salir</a>
              </Button>
            </section>

            <section className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4 sm:p-3 sm:col-span-2">
              <p className="text-xs font-black uppercase flex items-center gap-1.5 mb-1 text-destructive">
                <IconAlertTriangle className="size-3.5" /> Eliminar cuenta
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Para eliminar tu cuenta, escríbenos a{" "}
                <a
                  href="mailto:soporte@ejemplo.com"
                  className="underline text-foreground"
                >
                  soporte@ejemplo.com
                </a>
              </p>
            </section>
          </>
        )}
      </div>

      {isOwner && (
        <>
          <ContactDialog
            open={contactOpen}
            onOpenChange={setContactOpen}
            contactInfo={user.contactInfo ?? {}}
            userId={user.id}
            sub={sub}
          />
          <SavedSheet
            open={savedOpen}
            onOpenChange={setSavedOpen}
            savedPosts={savedPosts}
            userId={user.id}
          />
          <MetroDialog
            open={metroOpen}
            onOpenChange={setMetroOpen}
            user={user}
            sub={sub}
          />
          <PhotoDialog
            open={photoOpen}
            onOpenChange={setPhotoOpen}
            userId={user.id}
            currentUrl={user.photoUrl}
            sub={sub}
          />
        </>
      )}
    </div>
  );
}
