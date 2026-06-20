"use client";

import { useState } from "react";
import { ProductImages } from "@/components/feed/product-images";
import { Filters } from "@/components/feed/filters";
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
import { products } from "./hardcoded_example";

export default function Feed() {
  const [isDesktopDetailsOpen, setIsDetailsOpen] = useState(true);
  const toggleDetails = () => setIsDetailsOpen((isOpen) => !isOpen);

  const product = products[1]; // ejemplo hardcodeado

  return (
    <main className="flex-1 flex flex-row min-h-0 h-full">

      {/* LEFT */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <Filters />

        <div className="flex-1 overflow-hidden flex justify-center items-center gap-8 md:px-4">
          <IgnoreButton className="hidden md:flex" />

          <div className="relative h-full min-h-75 aspect-3/4 md:border-x overflow-hidden">
            <ProductImages images={product.images} />
            <ProductDetailsMobile details={product.details} className="absolute bottom-0 md:hidden" />
          </div>

          <LikeButton className="hidden md:flex" />
        </div>

        <div className="md:h-20 md:border-t flex items-center justify-center gap-6 my-6 md:my-0 overflow-hidden">
          <SaveButton />
          <IgnoreButton className="md:hidden" />
          <OpenDesktopDetailsButton className="hidden md:flex" onClick={toggleDetails} />
          <LikeButton className="md:hidden" />
          <OfferButton />
        </div>
      </div>

      {/* RIGHT */}
      {isDesktopDetailsOpen && (
        <div className="w-1/3 hidden md:block border-l overflow-hidden">
          <ProductDetailsDesktop details={product.details} onClose={toggleDetails} />
        </div>
      )}

    </main>
  );
}
