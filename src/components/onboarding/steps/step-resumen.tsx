"use client";

import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  IconAddressBook,
  IconMapPin,
  IconSparkles,
} from "@tabler/icons-react";
import type { Icon as TablerIcon } from "@tabler/icons-react";
import type { OnboardingSchema } from "../onboarding-form";

interface StepResumenProps {
  form: UseFormReturn<OnboardingSchema>;
  avatarPreview: string | null;
}

const BIO_MAX = 120;

function truncate(text: string) {
  return text.length > BIO_MAX ? text.slice(0, BIO_MAX) + "…" : text;
}

function SLabel({ icon: Icon, children }: { icon: TablerIcon; children: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="size-3.5 text-muted-foreground shrink-0" />
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {children}
      </p>
    </div>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted border text-xs font-medium">
      {children}
    </span>
  );
}

export function StepResumen({ form, avatarPreview }: StepResumenProps) {
  const vals = form.getValues();

  const contact = [
    vals.contactInstagram ? { label: "Instagram", value: `@${vals.contactInstagram}` } : null,
    vals.contactEmail    ? { label: "Correo",    value: vals.contactEmail }    : null,
    vals.contactWhatsapp ? { label: "WhatsApp",  value: vals.contactWhatsapp } : null,
  ].filter((c): c is { label: string; value: string } => c !== null);

  const hasStyle = !!(vals.clothingGender || vals.clothingTypes?.length || vals.size);

  return (
    <div className="flex flex-col gap-5">
      {/* Profile */}
      <div className="flex flex-col items-center gap-2">
        {avatarPreview && (
          <img
            src={avatarPreview}
            alt=""
            className="size-20 rounded-full object-cover ring-2 ring-border"
          />
        )}
        <p className="font-bold text-lg">@{vals.username.toLowerCase()}</p>
        {vals.bio && (
          <p className="text-xs text-muted-foreground text-center">{truncate(vals.bio)}</p>
        )}
      </div>

      {/* Style — always shown */}
      <div className="flex flex-col gap-2">
        <SLabel icon={IconSparkles}>Tu estilo</SLabel>
        {hasStyle ? (
          <div className="flex flex-wrap gap-2">
            {vals.clothingGender && <Pill>{vals.clothingGender}</Pill>}
            {vals.clothingTypes?.map((t) => <Pill key={t}>{t}</Pill>)}
            {vals.size && <Pill>Talla {vals.size}</Pill>}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </div>

      {/* Contact */}
      {contact.length > 0 && (
        <div className="flex flex-col gap-2">
          <SLabel icon={IconAddressBook}>Contacto</SLabel>
          <div className="flex flex-wrap gap-2">
            {contact.map((c) => <Pill key={c.label}>{c.value}</Pill>)}
          </div>
        </div>
      )}

      {/* Metro */}
      {vals.metro.length > 0 && (
        <div className="flex flex-col gap-2">
          <SLabel icon={IconMapPin}>Zona</SLabel>
          <div className="flex flex-wrap gap-2">
            {vals.metro.map((m) => <Pill key={m}>{m}</Pill>)}
          </div>
        </div>
      )}
    </div>
  );
}
