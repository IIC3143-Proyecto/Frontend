"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
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
import { SellerAvatar } from "@/components/feed/seller-avatar";
import { products } from "./hardcoded_posts";
import { tagsByCategory } from "./hardcoded_filters";

type FeedAction = "like" | "dislike" | "save" | "offer" | "rewind" | null;
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

export default function Feed() {
  const [isDesktopDetailsOpen, setIsDetailsOpen] = useState(true);
  const toggleDetails = () => setIsDetailsOpen((isOpen) => !isOpen);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);
  const [feedAction, setFeedAction] = useState<FeedAction>(null);
  const [lastDir, setLastDir] = useState<ExitDir | null>(null);
  const [isEntering, setIsEntering] = useState(false);

  const product = products[currentIndex % products.length];

  const trigger = useCallback((action: FeedAction) => {
    if (action === "rewind") {
      if (currentIndex === 0 || !lastDir) return;
      setIsEntering(true);
      setCurrentIndex((i) => i - 1);
      setTimeout(() => setIsEntering(false), ANIM_DURATION);
      return;
    }
    const dir: ExitDir =
      action === "like" ? "right" :
      action === "dislike" ? "left" : "up";

    setFeedAction(action);
    setLastDir(dir);
    setTimeout(() => {
      setCurrentIndex((i) => i + 1);
      setFeedAction(null);
    }, ANIM_DURATION);
  }, [currentIndex, lastDir]);

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
            key={currentIndex}
            className={cn(
              "relative h-full min-h-75 aspect-3/4 md:border-x overflow-hidden",
              isEntering
                ? enterClass(lastDir)
                : exitClass(feedAction)
            )}
          >
            <ProductImages images={product.images} />
            <SellerAvatar
              name="María González"
              imageUrl="https://res.cloudinary.com/demo/image/upload/w_100,h_100,c_fill,g_face/sample.jpg"
            />
            <ProductDetailsMobile details={product.details} className="absolute bottom-0 md:hidden" />
            <div className="absolute top-10 left-3 z-20 md:hidden">
              <RewindButton onClick={() => trigger("rewind")} disabled={currentIndex === 0 || !lastDir} />
            </div>
          </div>

          <LikeButton className="hidden md:flex" onClick={() => trigger("like")} />
        </div>

        {/* INTERACTION BUTTONS — orden original */}
        <div className="md:h-16 md:border-t flex items-center justify-center gap-6 my-4 md:my-0 overflow-hidden">
          <RewindButton className="hidden md:flex" onClick={() => trigger("rewind")} disabled={currentIndex === 0 || !lastDir} />
          <SaveButton onClick={() => trigger("save")} />
          <IgnoreButton className="md:hidden" onClick={() => trigger("dislike")} />
          <OpenDesktopDetailsButton className="hidden md:flex" onClick={toggleDetails} />
          <LikeButton className="md:hidden" onClick={() => trigger("like")} />
          <OfferButton onClick={() => trigger("offer")} />
        </div>
      </div>

      {/* DESKTOP SIDEBAR */}
      {isDesktopDetailsOpen && (
        <div className="w-1/3 hidden md:block border-l overflow-hidden">
          <ProductDetailsDesktop details={product.details} onClose={toggleDetails} />
        </div>
      )}

    </main>
  );
}
