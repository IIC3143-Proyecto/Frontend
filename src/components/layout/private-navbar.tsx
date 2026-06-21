"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NavigationIconButton } from "@/components/common/navigation-icon-button";
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
      <NavigationIconButton
        href="/"
        icon={IconHome}
        label="ir al feed"
        highlighted={pathname === "/"}
      />
      <NavigationIconButton
        href="/shopping-history"
        icon={IconShoppingCart}
        label="ir a mis compras"
        highlighted={pathname.startsWith("/shopping-history")}
      />
      <NavigationIconButton
        href="/publications"
        icon={IconBuildingStore}
        label="ir a mis ventas"
        highlighted={pathname.startsWith("/publications")}
      />
      <NavigationIconButton
        href="/notifications"
        icon={IconBell}
        label="ir a notificaciones"
        highlighted={pathname === "/notifications"}
      />
      <NavigationIconButton
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
      className="flex h-16 px-6 bg-background shrink-0 items-center sticky z-40 overflow-hidden
        order-last border-t justify-center bottom-0
        md:order-first md:border-b md:border-t-0 md:justify-between md:top-0"
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