"use client";

import { cn } from '@/lib/utils';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { VtrnaLogo } from "@/components/vtrna-logo";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { IconMenu2 } from "@tabler/icons-react";


type NavigationButtonsDirection = {
  direction: "row" | "column";
};

function NavigationButtons( { direction } : NavigationButtonsDirection ) {
  return (
    <nav className={cn("flex gap-3", direction === "row" ? "flex-row" : "flex-col px-6 py-6")}>
      <Button asChild type="button" variant="link">
        <Link href="/about-us">About us</Link>
      </Button>
      <Button asChild type="button" variant="link">
        <Link href="/faq">FAQ</Link>
      </Button>
      <Button asChild type="button" variant="default">
        <Link href="/signup">Sign up</Link>
      </Button>
      <Button asChild type="button" variant="outline">
        <Link href="/login">Login</Link>
      </Button>
    </nav>
  )
}

function MobileMenu() {
  const pathname = usePathname()
  
  return (
    <Sheet modal={false} key={pathname}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open navigation menu">
          <IconMenu2/>
        </Button>
      </SheetTrigger>
      
      <SheetContent side="top" showCloseButton={false} className="top-20! md:hidden" aria-describedby={undefined}>
        <VisuallyHidden asChild>
          <SheetTitle>Mobile Menu</SheetTitle>
        </VisuallyHidden>
        
        <NavigationButtons direction="column"/>
      </SheetContent>
    </Sheet>
  )
}

export function PublicNavbar() {
  return (
    <header className="flex h-20 px-6 border-b justify-between items-center sticky top-0 z-10 bg-background">
      <Link href="/"> 
        <VtrnaLogo className="text-primary"/>
      </Link>

      <div className="hidden md:block">
        <NavigationButtons direction="row"/>
      </div>

      <div className="md:hidden">
        <MobileMenu/>
      </div>
    </header>
  )
}