import { OffersList } from "@/components/offers/offers-list";

export default function OffersPage() {
  return (
    <div className="flex flex-col items-center">
      <h1 className="font-black uppercase text-lg tracking-wider">
        Mis Ofertas
      </h1>

      <OffersList />
    </div>
  );
}
