"use client";

import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconCoins } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { formatPriceCLP } from "@/lib/utils";
import { offerSchema, type OfferForm } from "./offer-schema";
import type { PostDto } from "@/lib/types/post";

type Props = {
  post: PostDto;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: OfferForm) => void;
};

export function MakeOfferForm({ post, open, onOpenChange, onSubmit }: Props) {
  const hasOffer = post.interactions.some((i) => i.type === "Offered");

  const min = Math.round(post.priceClp * 0.5);
  const max = post.priceClp;

  const form = useForm<OfferForm>({
    resolver: zodResolver(offerSchema),
    defaultValues: { priceClp: post.priceClp, comment: "" },
  });

  const { field: priceField } = useController({ control: form.control, name: "priceClp" });
  const currentPrice = Number(priceField.value) || post.priceClp;

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    priceField.onChange(Number(e.target.value));
  }

  function handleSubmit(data: OfferForm) {
    onSubmit(data);
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xs font-black uppercase flex items-center gap-1.5">
            <IconCoins className="size-3.5" /> Hacer oferta
          </DialogTitle>
        </DialogHeader>

        {hasOffer ? (
          <div className="flex flex-col gap-3 py-2">
            <p className="text-sm text-muted-foreground">Ya tienes una oferta activa en este artículo.</p>
            <Button variant="outline" onClick={() => { onOpenChange(false); alert("Redirigir a mis ofertas"); }}>
              Ver mis ofertas
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center gap-1 py-2">
                <p className="text-3xl font-bold tabular-nums">{formatPriceCLP(currentPrice)}</p>
                <p className="text-xs text-muted-foreground">de {formatPriceCLP(post.priceClp)}</p>
              </div>

              {post.isNegotiable && (
                <FormField
                  control={form.control}
                  name="priceClp"
                  render={() => (
                    <FormItem>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        step={50}
                        value={currentPrice}
                        onChange={handleSlider}
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground -mt-1">
                        <span>{formatPriceCLP(min)}</span>
                        <span>{formatPriceCLP(max)}</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <textarea
                      placeholder="Mensaje (opcional)"
                      className="flex w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none min-h-16"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>
        )}

        {!hasOffer && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={form.handleSubmit(handleSubmit)}>Enviar oferta</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
