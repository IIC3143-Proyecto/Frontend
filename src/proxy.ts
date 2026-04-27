import { auth0 } from "@/lib/auth0";
import { NextRequest } from "next/server";

// IMPORTANTE: Debe ser export default para que Next lo reconozca como la función de proxy
export default async function proxy(request: NextRequest) {
  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas excepto:
     * 1. /api (rutas de API)
     * 2. /_next (archivos estáticos)
     * 3. /_static (si existe)
     * 4. Archivos con extensión (favicon.ico, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};