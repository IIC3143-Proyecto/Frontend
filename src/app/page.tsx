"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { useUser } from "@auth0/nextjs-auth0";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  style: ["normal", "italic"],
});

export default function LandingPage() {
  const { user, isLoading } = useUser();
  const isLoggedIn = !!user;

  return (
    <>
      <PublicNavbar />
      <div className="flex flex-1 items-center justify-center overflow-hidden bg-background">
        <div className="flex flex-col items-center gap-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            <span className="block h-px w-7 bg-muted-foreground" />
            Vintage Market
            <span className="block h-px w-7 bg-muted-foreground" />
          </div>

          <div className="flex flex-col gap-4 items-center text-center">
            <h1
              className={`${playfair.className} text-5xl font-bold text-foreground sm:text-7xl`}
            >
              Compra y vende
              <br />
              <span className="bg-gradient-to-r from-foreground to-[#8B6F47] bg-clip-text italic text-transparent">
                moda vintage
              </span>
            </h1>

            <p className="max-w-sm text-base text-muted-foreground">
              La plataforma para encontrar piezas únicas y vender lo que ya no
              usas.
            </p>
          </div>

          <div className="flex w-full max-w-xs flex-col gap-3">
            {!isLoading &&
              (isLoggedIn ? (
                <Button
                    asChild
                    size="lg"
                    className="w-full py-6 text-xs font-medium uppercase tracking-widest"
                  >
                    <Link href="/feed">Ir al feed</Link>
                  </Button>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="w-full py-6 text-xs font-medium uppercase tracking-widest"
                  >
                    <Link href="/signup">Crear Cuenta</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="w-full py-6 text-xs font-medium uppercase tracking-widest"
                  >
                    <Link href="/login">Iniciar Sesión</Link>
                  </Button>
                </>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
