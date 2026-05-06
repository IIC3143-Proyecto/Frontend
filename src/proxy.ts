// src/middleware.ts
import { type NextRequest, NextResponse } from 'next/server';
import { auth0 } from './lib/auth0';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Identificar si la ruta es de Auth0 o de la App
  const isAuthRoute = pathname.startsWith('/login') || 
                      pathname.startsWith('/logout') || 
                      pathname.startsWith('/callback') || 
                      pathname.startsWith('/auth/profile'); // La ruta que vimos en tus logs

  console.log(`🛡️ ${isAuthRoute ? 'AUTH' : 'APP'} interceptando:`, pathname);

  // 2. Si es una ruta de Auth0, dejamos que el SDK se encargue
  if (isAuthRoute) {
    const authResponse = await auth0.middleware(request);
    // Solo retornamos si Auth0 realmente quiere hacer algo (como redirigir)
    if (authResponse) return authResponse;
  }

  // 3. OBTENER SESIÓN (Para tus rutas privadas)
  const session = await auth0.getSession(request);
  
  // 4. Lógica de protección de VTRNA
  const privateRoutes = ['/notifications', '/profile', '/publications', '/shopping-history', '/onboarding'];
  const isPrivateRoute = privateRoutes.some(route => pathname.startsWith(route));

  if (isPrivateRoute && !session) {
    console.log("🚫 Acceso denegado a:", pathname);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Si todo está bien o es ruta pública (como la Home /)
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};