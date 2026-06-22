import { type NextRequest, NextResponse } from 'next/server';
import { auth0 } from './lib/auth0';

type UserStatus = 'En proceso de registro' | 'Activo';
const REGISTERING: UserStatus = 'En proceso de registro';

export async function proxy(request: NextRequest) {
  const authResponse = await auth0.middleware(request);

  const { pathname } = request.nextUrl;
  const session = await auth0.getSession(request);

  const privateRoutes = ['/feed', '/notifications', '/profile', '/offers', '/onboarding', '/posts'];
  const isPrivateRoute = privateRoutes.some(route => pathname.startsWith(route));

  if (isPrivateRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session) {
    const { status } = session.user as { status?: UserStatus };
    const isOnboardingRoute = pathname.startsWith('/onboarding');

    // undefined → primer login antes de sync-user; useAuth lo maneja
    if (status === REGISTERING && isPrivateRoute && !isOnboardingRoute) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
    if (status && status !== REGISTERING && isOnboardingRoute) {
      return NextResponse.redirect(new URL('/feed', request.url));
    }
  }

  return authResponse ?? NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
