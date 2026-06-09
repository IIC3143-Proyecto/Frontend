"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LinkIconButton } from "@/components/common/link-icon-button";
import {
  IconHome,
  IconShoppingCart,
  IconBuildingStore,
  IconBell,
  IconUser,
} from "@tabler/icons-react";

function NavigationButtons() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-8 md:gap-6">
      <LinkIconButton
        href="/"
        icon={IconHome}
        label="ir al feed"
        highlighted={pathname === "/"}
      />
      <LinkIconButton
        href="/shopping-history"
        icon={IconShoppingCart}
        label="ir a mis compras"
        highlighted={pathname.startsWith("/shopping-history")}
      />
      <LinkIconButton
        href="/publications"
        icon={IconBuildingStore}
        label="ir a mis ventas"
        highlighted={pathname.startsWith("/publications")}
      />
      <LinkIconButton
        href="/notifications"
        icon={IconBell}
        label="ir a notificaciones"
        highlighted={pathname === "/notifications"}
      />
      <LinkIconButton
        href="/profile"
        icon={IconUser}
        label="ir a perfil"
        highlighted={pathname === "/profile"}
      />
    </nav>
  );
}

export function PrivateNavbar() {
  return (
    <header
      className="flex h-20 px-6 bg-background shrink-0 items-center
        order-last border-t justify-center
        md:order-first md:border-b md:justify-between"
    >
      <Link href="/" className="hidden md:block shrink-0">
        <Image
          src="/assets/vtrna-logo.svg"
          alt="vtrna logo"
          draggable={false}
          width={136}
          height={16}
          className="h-4 w-auto select-none pointer-events-none"
          unoptimized={true}
        />
      </Link>

      <NavigationButtons />
    </header>
  );
}