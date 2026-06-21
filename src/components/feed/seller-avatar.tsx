"use client";

import Image from "next/image";

type Props = {
  name: string;
  imageUrl: string;
};

export function SellerAvatar({ name, imageUrl }: Props) {
  return (
    <>
      {/* Mobile: bottom-right, a la altura del botón "VER MÁS" */}
      <div className="absolute z-10 bottom-6 right-3 md:hidden
        ring-2 ring-white rounded-full drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
        <div className="relative w-8 h-8">
          <Image src={imageUrl} alt={name} fill className="rounded-full object-cover" />
        </div>
      </div>

      {/* Desktop: bottom-right */}
      <div className="absolute z-10 bottom-4 right-3 hidden md:block
        ring-2 ring-white rounded-full drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
        <div className="relative w-9 h-9">
          <Image src={imageUrl} alt={name} fill className="rounded-full object-cover" />
        </div>
      </div>
    </>
  );
}
