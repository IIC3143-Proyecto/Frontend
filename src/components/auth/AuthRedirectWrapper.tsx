'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useCurrentUser } from '@/hooks/useCurrentUser'; // Usamos el nuevo hook
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function AuthRedirectWrapper({ children }: { children: React.ReactNode }) {
  const { user: authUser, isLoading: authLoading } = useUser();
  const { data: dbUser, isLoading: dbLoading } = useCurrentUser(); // Datos de NestJS/Mocks
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
  // 1. Si está cargando cualquiera de los dos, NO hacemos nada.
  if (authLoading || dbLoading) {
    return;
  }

  // 2. Si no hay sesión o no hay usuario DB
  if (!authUser || !dbUser) {
    return;
  }

  const hasPhoto = !!dbUser.photoUrl;
  const hasOnboarding = !!dbUser.onboardingCompleted;

  const protectedPaths = ['/feed', '/onboarding', '/complete-profile'];
  const isCurrentPathProtected = protectedPaths.some(p => pathname.startsWith(p));


  if (isCurrentPathProtected) {
    if (!hasPhoto) {
      if (pathname !== '/complete-profile') {
        router.replace('/complete-profile');
      }
    } else if (!hasOnboarding) {
      if (pathname !== '/onboarding') {
        router.replace('/onboarding');
      }
    } else {
      if (pathname === '/complete-profile' || pathname === '/onboarding') {
        router.replace('/feed');
      }
    }
  }
}, [authUser, dbUser, authLoading, dbLoading, pathname, router]);

  const isProtectedPath = ['/feed', '/onboarding', '/complete-profile']
  .some(p => pathname.startsWith(p));

    // 🔥 bloquear render hasta tener decisión estable
    if (isProtectedPath && (authLoading || dbLoading || !dbUser)) {
        return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Cargando...</p>
        </div>
        );
    }

  return <>{children}</>;
}