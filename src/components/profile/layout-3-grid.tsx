"use client";

import { useState } from "react";
import {
  IconBrandInstagram,
  IconDeviceMobile,
  IconMail,
  IconMapPin,
  IconBookmark,
  IconAlertTriangle,
  IconPencil,
} from "@tabler/icons-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { ProfileLayoutProps } from "@/lib/types/profile-mockup";
import { ZonaDialog } from "./zona-dialog";
import { ContactoDialog } from "./contacto-dialog";
import { SavedSheet } from "./saved-sheet";

export function Layout3Grid({ user, savedPosts }: ProfileLayoutProps) {
  const [zonaOpen, setZonaOpen] = useState(false);
  const [contactoOpen, setContactoOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);

  return (
    <div>
      {/* Header centrado */}
      <header className="bg-sidebar border-b border-border p-6 sm:p-8 sm:px-[50px] flex flex-col items-center gap-3 text-center">
        <Avatar className="size-20">
          <AvatarImage src={user.photoUrl} alt={user.username} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-black uppercase tracking-wide">@{user.username}</p>
          <p className="text-xs text-muted-foreground">{user.name}</p>
          <p className="text-sm mt-2 max-w-xs leading-relaxed">{user.bio}</p>
        </div>
      </header>

      {/* Mobile: columna centrada — Desktop: grid 2×2 con margen lateral */}
      <div className="flex flex-col gap-4 p-4 max-w-sm mx-auto sm:max-w-none sm:grid sm:grid-cols-2 sm:gap-3 sm:px-[50px] sm:py-4">

        {/* Zona */}
        <section className="bg-card border border-border rounded-2xl p-4 sm:p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase flex items-center gap-1.5 text-muted-foreground">
              <IconMapPin className="size-3.5" /> Zona
            </p>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setZonaOpen(true)}
            >
              Editar
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {user.stations.map((s) => (
              <span key={s} className="text-xs bg-muted px-1.5 py-0.5 rounded-full border border-border leading-tight">
                {s}
              </span>
            ))}
          </div>
        </section>

        {/* Contacto */}
        <section className="bg-card border border-border rounded-2xl p-4 sm:p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase flex items-center gap-1.5 text-muted-foreground">
              <IconPencil className="size-3.5" /> Contacto
            </p>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setContactoOpen(true)}
            >
              Editar
            </button>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-1.5">
              <IconBrandInstagram className="size-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{user.contactInfo.instagram}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IconDeviceMobile className="size-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{user.contactInfo.whatsapp}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IconMail className="size-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{user.contactInfo.email}</span>
            </div>
          </div>
        </section>

        {/* Guardados — col-span-2 en desktop */}
        <section className="bg-card border border-border rounded-2xl p-4 sm:p-3 sm:col-span-2 flex items-center justify-between">
          <p className="text-xs font-black uppercase flex items-center gap-1.5 text-muted-foreground">
            <IconBookmark className="size-3.5" /> Guardados ({savedPosts.length})
          </p>
          <Button size="sm" variant="outline" onClick={() => setSavedOpen(true)}>
            Ver guardados
          </Button>
        </section>

        {/* Zona peligrosa — col-span-2 en desktop */}
        <section className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4 sm:p-3 sm:col-span-2">
          <p className="text-xs font-black uppercase flex items-center gap-1.5 mb-1 text-destructive">
            <IconAlertTriangle className="size-3.5" /> Eliminar cuenta
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Para eliminar tu cuenta, escríbenos a{" "}
            <a href="mailto:soporte@ejemplo.com" className="underline text-foreground">
              soporte@ejemplo.com
            </a>
          </p>
        </section>
      </div>

      <ZonaDialog open={zonaOpen} onOpenChange={setZonaOpen} currentStations={user.stations} />
      <ContactoDialog open={contactoOpen} onOpenChange={setContactoOpen} contactInfo={user.contactInfo} />
      <SavedSheet open={savedOpen} onOpenChange={setSavedOpen} savedPosts={savedPosts} />
    </div>
  );
}
