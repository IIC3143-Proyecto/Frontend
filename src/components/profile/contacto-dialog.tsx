"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IconMail, IconPencil } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/common/text-input";
import { RestoreFieldHeader } from "./restore-field-header";
import type { ContactInfo } from "@/lib/types/user";

const contactoSchema = z
  .object({
    contactInstagram: z
      .string()
      .refine((v) => !v || !/\s/.test(v), "No puede contener espacios")
      .optional(),
    contactEmail: z.string().email("Email inválido").optional().or(z.literal("")),
    contactWhatsapp: z
      .string()
      .refine((v) => !v || /^\d{8}$/.test(v), "Debe tener exactamente 8 dígitos")
      .optional(),
  })
  .refine(
    (v) => v.contactInstagram || v.contactEmail || v.contactWhatsapp,
    { message: "Ingresa al menos un medio de contacto", path: ["contactInstagram"] },
  );

type ContactoForm = z.infer<typeof contactoSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactInfo: ContactInfo;
  onSave: (info: ContactInfo) => void;
  isSaving: boolean;
};

function toFormValues(contactInfo: ContactInfo): ContactoForm {
  return {
    contactInstagram: contactInfo.instagram?.replace(/^@/, ""),
    contactEmail: contactInfo.email,
    contactWhatsapp: contactInfo.whatsapp,
  };
}

function toContactInfo(form: ContactoForm): ContactInfo {
  return {
    instagram: form.contactInstagram || undefined,
    email: form.contactEmail || undefined,
    whatsapp: form.contactWhatsapp || undefined,
  };
}


export function ContactoDialog({ open, onOpenChange, contactInfo, onSave, isSaving }: Props) {
  const original = toFormValues(contactInfo);

  const form = useForm<ContactoForm>({
    resolver: zodResolver(contactoSchema),
    defaultValues: original,
  });

  const { dirtyFields } = form.formState;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xs font-black uppercase flex items-center gap-1.5">
            <IconPencil className="size-3.5" /> Editar contacto
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <div className="flex flex-col gap-6">
            <div>
              <RestoreFieldHeader
                label="Instagram"
                tooltip={`Original: @${original.contactInstagram ?? ""}`}
                isDirty={!!dirtyFields.contactInstagram}
                onReset={() => form.resetField("contactInstagram")}
              />
              <TextInput
                control={form.control}
                name="contactInstagram"
                placeholder="tu_usuario"
                prefix="@"
              />
            </div>

            <div>
              <RestoreFieldHeader
                label="Correo"
                tooltip={`Original: ${original.contactEmail ?? ""}`}
                isDirty={!!dirtyFields.contactEmail}
                onReset={() => form.resetField("contactEmail")}
              />
              <TextInput
                control={form.control}
                name="contactEmail"
                placeholder="tucorreo@ejemplo.com"
                type="email"
                icon={IconMail}
              />
            </div>

            <div>
              <RestoreFieldHeader
                label="WhatsApp"
                tooltip={`Original: +569 ${original.contactWhatsapp ?? ""}`}
                isDirty={!!dirtyFields.contactWhatsapp}
                onReset={() => form.resetField("contactWhatsapp")}
              />
              <TextInput
                control={form.control}
                name="contactWhatsapp"
                placeholder="12345678"
                prefix="+569"
                onlyDigits
                maxLength={8}
              />
            </div>
          </div>
        </Form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit((values) => onSave(toContactInfo(values)))}
            disabled={isSaving}
          >
            {isSaving ? "Guardando…" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
