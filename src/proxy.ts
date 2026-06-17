import { type NextRequest, NextResponse } from 'next/server';
import { auth0 } from './lib/auth0';

export async function proxy(request: NextRequest) {
  const authResponse = await auth0.middleware(request);

  const { pathname } = request.nextUrl;
  const session = await auth0.getSession(request);

  const privateRoutes = ['/notifications', '/publications', '/shopping-history', '/onboarding', '/posts', '/profile'];
  const isPrivateRoute = privateRoutes.some(route => pathname.startsWith(route));

  if (isPrivateRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session) {
    const { status } = session.user as { status?: string };
    const isOnboardingRoute = pathname.startsWith('/onboarding');

    // undefined → primer login antes de sync-user; useAuth lo maneja
    if (status === 'En proceso de registro' && isPrivateRoute && !isOnboardingRoute) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
    if (status && status !== 'En proceso de registro' && isOnboardingRoute) {
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  return authResponse ?? NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
