"use client";

import type { UseFormReturn } from "react-hook-form";
import type { OnboardingSchema } from "../onboarding-form";

interface StepResumenProps {
  form: UseFormReturn<OnboardingSchema>;
  avatarPreview: string | null;
}

function Row({ label, value }: { label: string; value?: string | string[] | number }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  const display = Array.isArray(value) ? value.join(", ") : String(value);
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-sm">{display}</span>
    </div>
  );
}

export function StepResumen({ form, avatarPreview }: StepResumenProps) {
  const vals = form.getValues();

  const contactParts = [
    vals.contactInstagram && `Instagram: ${vals.contactInstagram}`,
    vals.contactEmail && `Correo: ${vals.contactEmail}`,
    vals.contactWhatsapp && `WhatsApp: ${vals.contactWhatsapp}`,
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3">
        {avatarPreview && (
          <img
            src={avatarPreview}
            alt="Vista previa del avatar"
            className="size-20 rounded-full object-cover ring-2 ring-border"
          />
        )}
        <div className="text-center">
          <p className="font-semibold text-lg">@{vals.username}</p>
          {vals.bio && <p className="text-sm text-muted-foreground mt-1 max-w-xs">{vals.bio}</p>}
        </div>
      </div>

      {(vals.clothingGender || vals.clothingTypes?.length || vals.size) && (
        <div className="border rounded-xl p-4 bg-muted/40 flex flex-col gap-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tu estilo</p>
          <div className="flex flex-col gap-3">
            <Row label="Género de ropa" value={vals.clothingGender} />
            <Row label="Tipo de prenda" value={vals.clothingTypes} />
            <Row label="Talla" value={vals.size} />
          </div>
        </div>
      )}

      {contactParts.length > 0 && (
        <div className="border rounded-xl p-4 bg-muted/40 flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contacto</p>
          {contactParts.map((c) => (
            <span key={c} className="text-sm">{c}</span>
          ))}
        </div>
      )}

      {vals.metro && vals.metro.length > 0 && (
        <div className="border rounded-xl p-4 bg-muted/40 flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Zona</p>
          <Row label="Estaciones de metro" value={vals.metro} />
        </div>
      )}
    </div>
  );
}
