'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function AuthRedirectWrapper({ children }: { children: React.ReactNode }) {
  const { user: authUser, isLoading: authLoading } = useUser();
  const { data: dbUser, isLoading: dbLoading } = useCurrentUser();

  const router = useRouter();
  const pathname = usePathname();

  const isInitializing = authLoading || dbLoading;

  useEffect(() => {
    if (isInitializing) return;

    if (!authUser || !dbUser) return;

    const hasPhoto = !!dbUser.photoUrl;
    const hasOnboarding = !!dbUser.onboardingCompleted;

    const protectedPaths = ['/feed', '/onboarding', '/complete-profile'];
    const isProtected = protectedPaths.some(p => pathname.startsWith(p));

    if (!isProtected) return;

    if (!hasPhoto) {
      if (pathname !== '/complete-profile') {
        router.replace('/complete-profile');
      }
      return;
    }

    if (!hasOnboarding) {
      if (pathname !== '/onboarding') {
        router.replace('/onboarding');
      }
      return;
    }

    if (pathname === '/complete-profile' || pathname === '/onboarding') {
      router.replace('/feed');
    }

  }, [authUser, dbUser, authLoading, dbLoading, pathname, router, isInitializing]);

  const isProtectedPath = ['/feed', '/onboarding', '/complete-profile']
    .some(p => pathname.startsWith(p));

  if (isProtectedPath && isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-sm font-bold">
          Cargando sesión...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}