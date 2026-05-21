// src/middleware.ts
import { type NextRequest, NextResponse } from 'next/server';
import { auth0 } from './lib/auth0';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith('/login') || 
                      pathname.startsWith('/logout') || 
                      pathname.startsWith('/callback') || 
                      pathname.startsWith('/auth/profile'); 

  if (isAuthRoute) {
    const authResponse = await auth0.middleware(request);
    if (authResponse) return authResponse;
  }

  const session = await auth0.getSession(request);

  const privateRoutes = ['/notifications', '/profile', '/publications', '/shopping-history', '/onboarding'];
  const isPrivateRoute = privateRoutes.some(route => pathname.startsWith(route));

  if (isPrivateRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};