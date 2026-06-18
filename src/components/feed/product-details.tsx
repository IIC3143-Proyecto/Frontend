import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconX, IconInfoCircle } from "@tabler/icons-react";
import { formatPriceCLP } from "@/lib/utils";

// type Product = {
//   id: string;
//   details: ProductDetails;
//   images: string[];
// };

type ProductDetails = {
  title: string;
  description: string;
  price: number;
  size: string;
};

export function ProductDetailsDesktop({ onClose, details }: { onClose: () => void; details: ProductDetails }) {
  return (
    <>
      <div className="flex justify-end mr-1.5 mt-1.5">
        <Button size="icon-sm" variant="icon" onClick={onClose}>
          <IconX />
        </Button>
      </div>

      <div className="px-9 lg:px-11 flex flex-col gap-6">
        <h1 className="text-2xl font-black uppercase"> { details.title} </h1>

        <p className="text-sm leading-7 text-muted-foreground"> {details.description} </p>

        <div className="flex gap-4">
          <Badge> {formatPriceCLP(details.price)} </Badge>
          <Badge> Talla {details.size} </Badge>
        </div>
      </div>
    </>
  );
}

export function ProductDetailsMobile({ details, className }: { details: ProductDetails; className: string }) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const toggleDetails = () => setIsDetailsOpen((isOpen) => !isOpen);

  return (
    <div
      className={cn( 
        className, "flex gap-3 flex-col p-6 pt-8 w-full overflow-hidden",
        "bg-linear-to-t from-black/95 via-black/75 to-transparent",
      )}
    >
      <h1 className="text-2xl font-black uppercase text-white"> {details.title} </h1>

      {isDetailsOpen && (
        <p className="text-sm leading-relaxed text-secondary"> {details.description} </p>
      )}

      <div className="flex gap-3 items-center">
        <Badge variant="secondary"> {formatPriceCLP(details.price)} </Badge>
        <Badge variant="secondary"> Talla {details.size} </Badge>

        <OpenMobileDetailsButton onClick={toggleDetails} active={isDetailsOpen} className="" />
      </div>
    </div>
  );
}

export function OpenDesktopDetailsButton({ onClick, className }: { onClick: () => void; className: string }) {
  return (
    <Button size="icon-lg" variant="outline" className={className} onClick={onClick}>
      <IconInfoCircle className="text-gray-600" />
    </Button>
  );
}

export function OpenMobileDetailsButton({ onClick, className, active }: { onClick: () => void; className: string; active: boolean}) {
  return (
    <Button size="icon-xs" variant="secondary" className={cn(className, active && "bg-muted/70")} onClick={onClick}>
      <IconInfoCircle />
    </Button>
  );
}
