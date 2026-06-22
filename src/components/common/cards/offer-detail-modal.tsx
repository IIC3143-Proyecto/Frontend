import { IconTag, IconCalendar, IconMessage } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserProfileLink } from "@/components/common/user-profile-link";
import type { OfferDto } from "@/lib/types/offer";
import { OfferDirection } from "@/lib/types/offer-direction.enum";
import { formatPriceCLP } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  offer: OfferDto;
  direction: OfferDirection;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase text-muted-foreground mb-1">
      {children}
    </p>
  );
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function OfferDetailModal({ open, onClose, offer, direction }: Props) {
  const { post } = offer;

  const counterparty =
    direction === OfferDirection.RECEIVED ? offer.buyer : post.seller;
  const counterpartyLabel =
    direction === OfferDirection.RECEIVED ? "Comprador" : "Vendedor";

  const firstImage = post.imagesUrls?.split(";").filter(Boolean)[0];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xs font-black uppercase tracking-wider">
            Detalle de la oferta
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-6">
          <div className="flex flex-col gap-3">
            <div className="bg-muted aspect-5/6 flex items-center justify-center text-xs text-muted-foreground overflow-hidden">
              {firstImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={firstImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                "Imagen"
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div>
              <p className="text-2xl font-bold leading-tight">{post.title}</p>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-sm text-muted-foreground line-through">
                  {formatPriceCLP(post.priceClp)}
                </span>
                {post.isNegotiable && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <IconTag className="w-4 h-4" />
                    Negociable
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <SectionLabel>Oferta</SectionLabel>
                <p className="text-2xl font-bold text-chart-3">
                  {formatPriceCLP(offer.priceClp)}
                </p>
              </div>
              <div>
                <SectionLabel>Estado</SectionLabel>
                <p className="font-medium">{offer.status}</p>
              </div>
            </div>

            <div>
              <SectionLabel>{counterpartyLabel}</SectionLabel>
              <p>
                <UserProfileLink user={counterparty} />
              </p>
            </div>

            {offer.comment && (
              <div>
                <SectionLabel>Comentario</SectionLabel>
                <p className="flex items-start gap-1 text-sm">
                  <IconMessage className="w-4 h-4 shrink-0 mt-0.5" />
                  {offer.comment}
                </p>
              </div>
            )}

            <div>
              <SectionLabel>Fecha</SectionLabel>
              <p className="flex items-center gap-1 text-sm">
                <IconCalendar className="w-4 h-4 shrink-0" />
                {formatDate(offer.createdAtUtcMinus3)}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
