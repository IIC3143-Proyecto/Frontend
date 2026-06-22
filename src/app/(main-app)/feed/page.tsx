"use client";

import { useState, useEffect } from "react";
import { IconLoader2 } from "@tabler/icons-react";
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
  RewindButton,
} from "@/components/feed/interaction-buttons";
import { PostTransition } from "@/components/feed/post-transition";
import { useFeedNavigation } from "@/hooks/use-feed-navigation";
import { useSearchByTags } from "@/hooks/use-feed";
import { useTags } from "@/hooks/use-tags";
import { usePostSaveState } from "@/hooks/use-post-save-state";
import { MakeOfferForm } from "@/components/common/cards/make-offer/make-offer-form";
import { useCreateOffer } from "@/hooks/use-create-offer";
import { extractDetails } from "@/components/feed/extract-product-details";
import { SellerAvatar } from "@/components/feed/seller-avatar";
import type { ProductPost } from "@/hooks/use-feed-navigation";

export default function Feed() {
  const [isDesktopDetailsOpen, setIsDetailsOpen] = useState(true);
  const toggleDetails = () => setIsDetailsOpen((isOpen) => !isOpen);

  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);
  const [searchIndex, setSearchIndex] = useState(0);

  const { categories: tagsByCategory } = useTags();

  const {
    currentPost: product,
    direction,
    isLoading,
    isFinished,
    like,
    ignore,
    rewind,
    canGoBack,
  } = useFeedNavigation();

  const isFiltering = appliedFilters.length > 0;
  const { data: searchResults = [], isFetching: isSearching } = useSearchByTags(
    isFiltering ? appliedFilters : []
  );

  useEffect(() => { setSearchIndex(0); }, [appliedFilters]);

  const searchPost = searchResults[searchIndex];
  const displayProduct: ProductPost | null = isFiltering
    ? (searchPost ? { ...searchPost, size: "" } : null)
    : product;

  const { isSaved, toggleSave, isSavePending } = usePostSaveState(displayProduct?.id ?? null);

  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const createOffer = useCreateOffer();

  const handleLike = () => {
    if (isFiltering) { setSearchIndex((i) => i + 1); return; }
    like();
  };

  const handleIgnore = () => {
    if (isFiltering) { setSearchIndex((i) => i + 1); return; }
    ignore();
  };

  const handleRewind = () => {
    if (isFiltering) { setSearchIndex((i) => Math.max(0, i - 1)); return; }
    rewind();
  };

  const canRewind = isFiltering ? searchIndex > 0 : canGoBack;
  const isContentLoading = isLoading || isSearching;
  const isEmpty = !displayProduct && !isContentLoading && (isFiltering || isFinished);

  return (
    <main className="flex-1 flex flex-row min-h-0 h-full">
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        {/* FILTERS */}
        <Filters
          filtersByCategory={tagsByCategory}
          appliedFilters={appliedFilters}
          setAppliedFilters={setAppliedFilters}
        />

        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-hidden flex justify-center items-center gap-8 md:px-4">
          <IgnoreButton className="hidden md:flex" onClick={handleIgnore} />

          <div className="relative h-full min-h-75 aspect-3/4 md:border-x overflow-hidden">
            {isContentLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <IconLoader2 className="size-8 text-muted-foreground animate-spin" />
              </div>
            ) : isEmpty ? (
              <div className="flex-1 flex items-center justify-center border h-full">
                No hay más publicaciones.
              </div>
            ) : displayProduct ? (
              <PostTransition postKey={displayProduct.id} direction={isFiltering ? 1 : direction}>
                <ProductImages images={displayProduct.imagesUrls ? displayProduct.imagesUrls.split(";").filter(Boolean) : []} />
                <SellerAvatar alt={displayProduct.seller.name} imageUrl={displayProduct.seller.photoUrl} />
                <ProductDetailsMobile details={extractDetails(displayProduct)} className="absolute bottom-0 md:hidden" />
                <div className="absolute top-10 left-3 z-20 md:hidden">
                  <RewindButton onClick={handleRewind} disabled={!canRewind} />
                </div>
              </PostTransition>
            ) : null}
          </div>

          <LikeButton className="hidden md:flex" onClick={handleLike} />
        </div>

        {/* INTERACTION BUTTONS */}
        <div className="md:h-20 md:border-t flex items-center justify-center gap-6 my-6 md:my-0 overflow-hidden">
          <RewindButton className="hidden md:flex" onClick={handleRewind} disabled={!canRewind} />
          <SaveButton active={isSaved} disabled={isSavePending} onClick={toggleSave} />
          <IgnoreButton className="md:hidden" onClick={handleIgnore} />
          <OpenDesktopDetailsButton className="hidden md:flex" onClick={toggleDetails} />
          <LikeButton className="md:hidden" onClick={handleLike} />
          <OfferButton onClick={() => displayProduct && setIsOfferOpen(true)} />
        </div>
      </div>

      {/* MODAL DE OFERTA */}
      {displayProduct && (
        <MakeOfferForm
          post={displayProduct}
          open={isOfferOpen}
          onOpenChange={setIsOfferOpen}
          onSubmit={(data) => createOffer.mutate({ postId: displayProduct.id, ...data })}
        />
      )}

      {/* DESKTOP SIDEBAR */}
      {isDesktopDetailsOpen && displayProduct && (
        <div className="w-1/3 hidden md:block border-l overflow-hidden">
          <ProductDetailsDesktop details={extractDetails(displayProduct)} onClose={toggleDetails} />
        </div>
      )}
    </main>
  );
}
