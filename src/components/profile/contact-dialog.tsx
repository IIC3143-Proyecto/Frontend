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
import { usePatchContact } from "@/hooks/use-patch-user";
import type { ContactInfo } from "@/lib/types/user";

const contactSchema = z
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

type ContactForm = z.infer<typeof contactSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactInfo: ContactInfo;
  userId: string;
  sub: string;
};

function toFormValues(contactInfo: ContactInfo): ContactForm {
  return {
    contactInstagram: contactInfo.instagram?.replace(/^@/, ""),
    contactEmail: contactInfo.email,
    contactWhatsapp: contactInfo.whatsapp,
  };
}

function toContactInfo(form: ContactForm): ContactInfo {
  return {
    instagram: form.contactInstagram || undefined,
    email: form.contactEmail || undefined,
    whatsapp: form.contactWhatsapp || undefined,
  };
}

export function ContactDialog({ open, onOpenChange, contactInfo, userId, sub }: Props) {
  const original = toFormValues(contactInfo);
  const patchContact = usePatchContact();

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: original,
  });

  const { dirtyFields } = form.formState;

  function handleSave(values: ContactForm) {
    patchContact.mutate(
      { userId, sub, contactInfo: toContactInfo(values) },
      { onSuccess: () => onOpenChange(false) },
    );
  }

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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={patchContact.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(handleSave)}
            disabled={patchContact.isPending}
          >
            {patchContact.isPending ? "Guardando…" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
