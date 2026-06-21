"use client";

import { useState } from "react";
import { ProductImages } from "@/components/feed/product-images";
import { Filters } from "@/components/feed/filters/filters";
import {
  ProductDetailsMobile,
  ProductDetailsDesktop,
  OpenDesktopDetailsButton,
} from "@/components/feed/product-details";
import {
  IgnoreButton,
  LikeButton,
  SaveButton,
  OfferButton,
} from "@/components/feed/interaction-buttons";
import { PostTransition } from "@/components/feed/post-transition";
import { tagsByCategory } from "./hardcoded_filters";
import { useFeedNavigation } from "@/hooks/use-feed-navigation";
import { MakeOfferForm } from "@/components/common/cards/make-offer/make-offer-form";
import { useCreateOffer } from "@/hooks/use-create-offer";
import { extractDetails } from "@/components/feed/extract-product-details";
import { SellerAvatar } from "@/components/feed/seller-avatar";


export default function Feed() {
  const [isDesktopDetailsOpen, setIsDetailsOpen] = useState(true);
  const toggleDetails = () => setIsDetailsOpen((isOpen) => !isOpen);

  const [appliedFilters , setAppliedFilters] = useState<string[]>([]);

  const {
    currentPost: product,
    direction,
    isLoading,
    isFinished,
    like,
    ignore,
    isSaved,
    toggleSave,
    isSavePending,
} = useFeedNavigation();

  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const createOffer = useCreateOffer();
  
  return (
    <main className="flex-1 flex flex-row min-h-0 h-full">
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        {/* FILTERS */}
        <Filters 
          filtersByCategory={tagsByCategory}
          appliedFilters={appliedFilters}
          setAppliedFilters={setAppliedFilters}
        />

        {/* MAIN CONTENT*/}
        <div className="flex-1 overflow-hidden flex justify-center items-center gap-8 md:px-4">
          <IgnoreButton className="hidden md:flex" onClick={ignore} />

          <div className="relative h-full min-h-75 aspect-3/4 md:border-x overflow-hidden">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center border h-full">
                Cargando...
              </div>
            ) : isFinished || !product ? (
              <div className="flex-1 flex items-center justify-center border h-full">
                No hay más publicaciones.
              </div>
            ) : (
              <PostTransition postKey={product.id} direction={direction}>
                <ProductImages images={product.imagesUrls ? product.imagesUrls.split(";").filter(Boolean) : []} />
                <SellerAvatar alt={product.seller.name} imageUrl={product.seller.photoUrl} />
                <ProductDetailsMobile  details={extractDetails(product)} className="absolute bottom-0 md:hidden" />
              </PostTransition>
            )}
          </div>

          <LikeButton className="hidden md:flex" onClick={like} />
        </div>

        {/* INTERACTION BUTTONS */}
        <div className="md:h-20 md:border-t flex items-center justify-center gap-6 my-6 md:my-0 overflow-hidden">
          <SaveButton active={isSaved} disabled={isSavePending} onClick={toggleSave}/>
          <IgnoreButton className="md:hidden" onClick={ignore} />
          <OpenDesktopDetailsButton className="hidden md:flex" onClick={toggleDetails} />
          <LikeButton className="md:hidden" onClick={like} />
          <OfferButton onClick={() => product && setIsOfferOpen(true)}/>
        </div>
      </div>

      {/* MODAL DE OFERTA */}
      {product && (
        <MakeOfferForm
          post={product}
          open={isOfferOpen}
          onOpenChange={setIsOfferOpen}
          onSubmit={(data) => createOffer.mutate({ postId: product.id, ...data })}
        />
      )}

      {/* DESKTOP SIDEBAR */}
      {isDesktopDetailsOpen && product && (
        <div className="w-1/3 hidden md:block border-l overflow-hidden">
          <ProductDetailsDesktop details={extractDetails(product)} onClose={toggleDetails} />
        </div>
      )}

    </main>
  );
}
