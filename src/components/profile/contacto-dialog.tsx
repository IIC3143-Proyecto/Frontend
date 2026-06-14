"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IconMail, IconPencil, IconInfoCircle } from "@tabler/icons-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { MockUser } from "@/lib/types/profile-mockup";

const contactoSchema = z.object({
  contactInstagram: z
    .string()
    .refine((v) => !v || !/\s/.test(v), "No puede contener espacios")
    .optional(),
  contactEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  contactWhatsapp: z
    .string()
    .refine((v) => !v || /^\d{8}$/.test(v), "Debe tener exactamente 8 dígitos")
    .optional(),
});

type ContactoForm = z.infer<typeof contactoSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactInfo: MockUser["contactInfo"];
};

function toFormValues(contactInfo: MockUser["contactInfo"]): ContactoForm {
  return {
    contactInstagram: contactInfo.instagram.replace(/^@/, ""),
    contactEmail: contactInfo.email,
    contactWhatsapp: contactInfo.whatsapp,
  };
}

type FieldHeaderProps = {
  label: string;
  tooltip: string;
  isDirty: boolean;
  onReset: () => void;
};

function FieldHeader({ label, tooltip, isDirty, onReset }: FieldHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex text-muted-foreground/40 hover:text-muted-foreground cursor-default transition-colors">
                <IconInfoCircle className="size-3" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-[10px]">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <button
          type="button"
          disabled={!isDirty}
          onClick={onReset}
          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Restablecer
        </button>
      </div>
    </div>
  );
}

export function ContactoDialog({ open, onOpenChange, contactInfo }: Props) {
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
              <FieldHeader
                label="Instagram"
                tooltip={`Original: @${original.contactInstagram}`}
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
              <FieldHeader
                label="Correo"
                tooltip={`Original: ${original.contactEmail}`}
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
              <FieldHeader
                label="WhatsApp"
                tooltip={`Original: +569 ${original.contactWhatsapp}`}
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onOpenChange(false)}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
