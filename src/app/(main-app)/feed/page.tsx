"use client";

import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ProductImages } from "@/components/feed/product-images";
import { Filters } from "@/components/feed/filters/filters";
import { SellerAvatar } from "@/components/feed/seller-avatar";
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
import { IconLoader2 } from "@tabler/icons-react";
import { MakeOfferForm } from "@/components/common/cards/make-offer/make-offer-form";
import { useCreateOffer } from "@/hooks/use-create-offer";
import { usePaginatedFeed, useSearchByTags } from "@/hooks/use-feed";
import { useFeedNavigation } from "@/hooks/use-feed-navigation";
import { useCreateInteraction } from "@/hooks/use-interaction";
import { useTags } from "@/hooks/use-tags";

type FeedAction = "like" | "dislike" | "save" | "rewind" | null;
type ExitDir = "right" | "left" | "up";

const ANIM_DURATION = 380;

function exitClass(action: FeedAction): string {
  if (!action || action === "rewind") return "";
  const dir: ExitDir =
    action === "like" ? "right" :
    action === "dislike" ? "left" : "up";
  const base =
    dir === "right" ? "translate-x-full" :
    dir === "left"  ? "-translate-x-full" :
    "-translate-y-full";
  const rot = dir === "right" ? "rotate-12" : dir === "left" ? "-rotate-12" : "rotate-6";
  return `transition-all duration-[380ms] ease-in ${base} ${rot}`;
}

function enterClass(dir: ExitDir | null): string {
  if (!dir) return "";
  const from = dir === "right" ? "slide-in-from-right" : dir === "left" ? "slide-in-from-left" : "slide-in-from-top";
  return `animate-in ${from} duration-[380ms]`;
}

function parseImages(raw: string): string[] {
  if (!raw) return [];
  return raw.split(";").filter(Boolean);
}

export default function Feed() {
  const [isDesktopDetailsOpen, setIsDetailsOpen] = useState(false);
  const toggleDetails = () => setIsDetailsOpen((open) => !open);
  const [isOfferOpen, setIsOfferOpen] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);
  const [feedAction, setFeedAction] = useState<FeedAction>(null);
  const [lastDir, setLastDir] = useState<ExitDir | null>(null);
  const [isEntering, setIsEntering] = useState(false);
  const [searchIndex, setSearchIndex] = useState(0);

  const { posts, isFetching, prefetchIfNeeded } = usePaginatedFeed();
  const { currentIndex, canGoBack, advance, goBack } = useFeedNavigation();
  const createInteraction = useCreateInteraction();
  const createOffer = useCreateOffer();
  const { categories: tagsByCategory } = useTags();

  const isFiltering = appliedFilters.length > 0;
  const { data: searchResults = [], isFetching: isSearching } = useSearchByTags(
    isFiltering ? appliedFilters : []
  );

  const post = isFiltering
    ? searchResults[searchIndex]
    : posts[currentIndex];

  // Prefetch cuando se acerca al final del feed
  useEffect(() => {
    if (!isFiltering) prefetchIfNeeded(currentIndex);
  }, [currentIndex, isFiltering, prefetchIfNeeded]);

  // Resetear índice de búsqueda cuando cambian los filtros
  useEffect(() => { setSearchIndex(0); }, [appliedFilters]);

  const trigger = useCallback(async (action: FeedAction) => {
    if (!post) return;

    if (action === "rewind") {
      if (isFiltering) {
        setSearchIndex((i) => Math.max(0, i - 1));
        return;
      }
      if (!canGoBack || !lastDir) return;
      setIsEntering(true);
      await goBack();
      setTimeout(() => setIsEntering(false), ANIM_DURATION);
      return;
    }

    const dir: ExitDir =
      action === "like" ? "right" :
      action === "dislike" ? "left" : "up";

    setFeedAction(action);
    setLastDir(dir);

    setTimeout(() => {
      if (isFiltering) {
        setSearchIndex((i) => i + 1);
      } else {
        const interaction: "Liked" | "Saved" | null =
          action === "like" ? "Liked" :
          action === "save" ? "Saved" : null;
        advance(post.id, interaction);
        if (interaction) {
          createInteraction.mutate({ postId: post.id, type: interaction });
        }
      }
      setFeedAction(null);
    }, ANIM_DURATION);
  }, [post, isFiltering, canGoBack, lastDir, advance, goBack, createInteraction]);

  const images = parseImages(post?.imagesUrls ?? "");
  const isLoading = isFetching && !post;
  const isEmpty = !post && !isFetching && !isSearching;

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
          <IgnoreButton className="hidden md:flex" onClick={() => trigger("dislike")} />

          <div
            key={isFiltering ? `s-${searchIndex}` : currentIndex}
            className={cn(
              "relative h-full min-h-75 aspect-3/4 md:border-x overflow-hidden",
              isEntering
                ? enterClass(lastDir)
                : exitClass(feedAction)
            )}
          >
            {isLoading || isSearching ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <IconLoader2 className="size-8 text-muted-foreground animate-spin" />
              </div>
            ) : isEmpty ? (
              <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
                <p className="text-muted-foreground text-sm">No hay más publicaciones por ahora</p>
              </div>
            ) : post ? (
              <>
                <ProductImages images={images.length ? images : ["https://res.cloudinary.com/demo/image/upload/woman-blackdress-stairs.webp"]} />
                <SellerAvatar
                  name={post.seller.name}
                  imageUrl={post.seller.photoUrl ?? "https://res.cloudinary.com/demo/image/upload/w_100,h_100,c_fill,g_face/sample.jpg"}
                />
                <ProductDetailsMobile
                  details={{
                    title: post.title,
                    description: post.description,
                    price: post.priceClp,
                    size: "",
                  }}
                  className="absolute bottom-0 md:hidden"
                />
                <div className="absolute top-10 left-3 z-20 md:hidden">
                  <RewindButton
                    onClick={() => trigger("rewind")}
                    disabled={isFiltering ? searchIndex === 0 : !canGoBack}
                  />
                </div>
              </>
            ) : null}
          </div>

          <LikeButton className="hidden md:flex" onClick={() => trigger("like")} />
        </div>

        {/* INTERACTION BUTTONS */}
        <div className="md:h-16 md:border-t flex items-center justify-center gap-6 my-4 md:my-0 overflow-hidden">
          <RewindButton
            className="hidden md:flex"
            onClick={() => trigger("rewind")}
            disabled={isFiltering ? searchIndex === 0 : !canGoBack}
          />
          <SaveButton onClick={() => trigger("save")} />
          <IgnoreButton className="md:hidden" onClick={() => trigger("dislike")} />
          <OpenDesktopDetailsButton className="hidden md:flex" onClick={toggleDetails} />
          <LikeButton className="md:hidden" onClick={() => trigger("like")} />
          <OfferButton onClick={() => post && setIsOfferOpen(true)} />
        </div>
      </div>

      {/* MODAL DE OFERTA */}
      {post && (
        <MakeOfferForm
          post={post}
          open={isOfferOpen}
          onOpenChange={setIsOfferOpen}
          onSubmit={(data) => createOffer.mutate({ postId: post.id, ...data })}
        />
      )}

      {/* DESKTOP SIDEBAR */}
      {isDesktopDetailsOpen && post && (
        <div className="w-1/3 hidden md:block border-l overflow-hidden">
          <ProductDetailsDesktop
            details={{
              title: post.title,
              description: post.description,
              price: post.priceClp,
              size: "",
            }}
            onClose={toggleDetails}
          />
        </div>
      )}
    </main>
  );
}
