import { type NextRequest, NextResponse } from 'next/server';
import { auth0 } from './lib/auth0';

export async function proxy(request: NextRequest) {
  const authResponse = await auth0.middleware(request);

  const { pathname } = request.nextUrl;
  const session = await auth0.getSession(request);

  const privateRoutes = ['/notifications', '/profile', '/publications', '/shopping-history', '/onboarding', '/posts'];
  const isPrivateRoute = privateRoutes.some(route => pathname.startsWith(route));

  if (isPrivateRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session) {
    const { onboardingCompleted: isOnboardingCompleted } = session.user as { onboardingCompleted?: boolean };
    const isOnboardingRoute = pathname.startsWith('/onboarding');

    // undefined → primer login antes de sync-user; useAuth lo maneja
    if (isOnboardingCompleted === false && isPrivateRoute && !isOnboardingRoute) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
    if (isOnboardingCompleted === true && isOnboardingRoute) {
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  return authResponse ?? NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
