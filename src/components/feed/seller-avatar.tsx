"use client";

import Image from "next/image";
import Link from "next/link";

export function SellerAvatar({ alt, imageUrl, href }: { alt: string; imageUrl?: string; href?: string }) {
  const fallbackUrl =
    "https://res.cloudinary.com/demo/image/upload/w_100,h_100,c_fill,g_face/sample.jpg";

  const finalUrl = imageUrl || fallbackUrl;

  const circle = (size: string) => (
    <div className={`relative ${size} overflow-hidden rounded-full`}>
      <Image src={finalUrl} alt={alt} fill className="object-cover" />
    </div>
  );

  const wrap = (content: React.ReactNode) =>
    href ? (
      <Link href={href} aria-label={`Ver perfil de ${alt}`} className="block">
        {content}
      </Link>
    ) : (
      content
    );

  return (
    <>
      <div className="absolute z-10 bottom-6 right-3 md:hidden
        ring-2 ring-white rounded-full drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
        {wrap(circle("w-8 h-8"))}
      </div>

      <div className="absolute z-10 bottom-4 right-3 hidden md:block
        ring-2 ring-white rounded-full drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
        {wrap(circle("w-9 h-9"))}
      </div>
    </>
  );
}
