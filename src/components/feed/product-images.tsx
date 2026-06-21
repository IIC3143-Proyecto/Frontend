"use client";

import { useState, useCallback, useRef } from "react";
import type { EmblaCarouselType } from "embla-carousel";
import Image from "next/image";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export function ProductImages({ images }: { images: string[] }) {
  if (images.length <= 1) {
    return <SingleImageContainer image={images[0]} />;
  }
  return <MultipleImagesContainer images={images} />;
}

function SingleImageContainer({ image }: { image: string }) {
  return (
    <Image src={image} alt="imagen del producto" fill className="object-contain" />
  );
}

function MultipleImagesContainer({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const apiRef = useRef<EmblaCarouselType | null>(null);

  const onApiChange = useCallback((api: EmblaCarouselType | undefined) => {
    if (!api) return;
    apiRef.current = api;
    setCurrentIndex(api.selectedScrollSnap());
    api.on("select", () => setCurrentIndex(api.selectedScrollSnap()));
  }, []);

  return (
    <Carousel setApi={onApiChange}>
      <CarouselContent>
        {images.map((src, i) => (
          <CarouselItem key={i}>
            <SingleImageContainer image={src} />
          </CarouselItem>
        ))}
      </CarouselContent>

      <PhotoProgressBar images={images} currentIndex={currentIndex} />

      {/* Zona izquierda — imagen anterior */}
      <button
        onClick={() => apiRef.current?.scrollPrev()}
        className="absolute inset-y-0 left-0 w-1/3 z-10 flex items-center justify-start pl-5 group"
        aria-label="Foto anterior"
      >
        <IconChevronLeft
          size={36}
          className="text-white opacity-0 group-hover:opacity-60 transition-opacity duration-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
        />
      </button>

      {/* Zona derecha — imagen siguiente */}
      <button
        onClick={() => apiRef.current?.scrollNext()}
        className="absolute inset-y-0 right-0 w-1/3 z-10 flex items-center justify-end pr-5 group"
        aria-label="Foto siguiente"
      >
        <IconChevronRight
          size={36}
          className="text-white opacity-0 group-hover:opacity-60 transition-opacity duration-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
        />
      </button>
    </Carousel>
  );
}

function PhotoProgressBar({
  images,
  currentIndex,
}: {
  images: string[];
  currentIndex: number;
}) {
  return (
    <div className="absolute top-2 inset-x-2 z-10">
      <div className="flex gap-1.5">
        {images.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-0.5 flex-1 rounded-full transition-all duration-300 drop-shadow-[0_0_3px_rgba(0,0,0,0.7)]",
              i === currentIndex ? "bg-white" : "bg-white/40"
            )}
          />
        ))}
      </div>
    </div>
  );
}
