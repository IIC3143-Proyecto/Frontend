import { IconMapPin, IconTag } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { PostDto as Post } from "@/lib/types/post";
import { formatPriceCLP } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  post: Post;
};

// TODO: estos campos aún no están en el modelo Post — placeholders por ahora.
const PLACEHOLDER_CATEGORY = ["Streetwear", "Negro"];
const PLACEHOLDER_SPECS = ["Hombre", "Talla M · Usado buen estado"];
const PLACEHOLDER_LOCATION = "Línea 1, Los Leones";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase text-muted-foreground mb-1">
      {children}
    </p>
  );
}

export function PostDetailModal({ open, onClose, post }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xs font-black uppercase tracking-wider">
            Detalles de la prenda
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-6">
          <div className="flex flex-col gap-3">
            <div className="bg-muted aspect-5/6 flex items-center justify-center text-xs text-muted-foreground">
              Imagen
            </div>
            <Button variant="outline" className="w-full">
              Ver más fotos
            </Button>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div>
              <p className="text-2xl font-bold leading-tight">{post.title}</p>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <p className="text-2xl font-bold text-chart-3">
                  {formatPriceCLP(post.priceClp)}
                </p>
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
                <SectionLabel>Categoría</SectionLabel>
                {PLACEHOLDER_CATEGORY.map((value) => (
                  <p key={value}>{value}</p>
                ))}
              </div>
              <div>
                <SectionLabel>Especificaciones</SectionLabel>
                {PLACEHOLDER_SPECS.map((value) => (
                  <p key={value}>{value}</p>
                ))}
              </div>
            </div>

            <div>
              <SectionLabel>Ubicación</SectionLabel>
              <p className="flex items-center gap-1">
                <IconMapPin className="w-4 h-4 shrink-0" />
                {PLACEHOLDER_LOCATION}
              </p>
            </div>

            <div>
              <SectionLabel>Descripción</SectionLabel>
              <p className="text-sm">{post.description}</p>
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
