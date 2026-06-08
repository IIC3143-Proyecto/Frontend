import { type NextRequest, NextResponse } from 'next/server';
import { auth0 } from './lib/auth0';

export async function proxy(request: NextRequest) {
  const authResponse = await auth0.middleware(request);

  const { pathname } = request.nextUrl;
  const session = await auth0.getSession(request);

  // TODO: remove '/test' once feature is shipped
  const privateRoutes = ['/notifications', '/profile', '/publications', '/shopping-history', '/onboarding', '/test'];
  const isPrivateRoute = privateRoutes.some(route => pathname.startsWith(route));

  if (isPrivateRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return authResponse ?? NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};