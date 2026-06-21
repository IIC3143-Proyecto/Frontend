"use client";

import Image from "next/image";

export function SellerAvatar({ alt, imageUrl }: { alt: string; imageUrl?: string }) {
  const fallbackUrl =
    "https://res.cloudinary.com/demo/image/upload/w_100,h_100,c_fill,g_face/sample.jpg";

  const finalUrl = imageUrl || fallbackUrl;

  return (
    <>
      {/* Mobile */}
      <div className="absolute z-10 bottom-6 right-3 md:hidden
        ring-2 ring-white rounded-full drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
        <div className="relative w-8 h-8 overflow-hidden rounded-full">
          <Image src={finalUrl} alt={alt} fill className="object-cover" />
        </div>
      </div>

      {/* Desktop */}
      <div className="absolute z-10 bottom-4 right-3 hidden md:block
        ring-2 ring-white rounded-full drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
        <div className="relative w-9 h-9 overflow-hidden rounded-full">
          <Image src={finalUrl} alt={alt} fill className="object-cover" />
        </div>
      </div>
    </>
  );
}
