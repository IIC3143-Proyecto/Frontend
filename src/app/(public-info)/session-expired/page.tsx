import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SessionExpiredPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">Sesión expirada</h1>
        <p className="text-muted-foreground text-sm max-w-sm">
          Tu sesión ha expirado. Por favor, inicia sesión nuevamente para continuar usando la aplicación.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/login">Log in</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
