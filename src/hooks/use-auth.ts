// src/hooks/use-auth.ts
import { useUser } from '@auth0/nextjs-auth0';
import { useQuery } from '@tanstack/react-query';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth() {
  const { user, isLoading: authLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const { data: dbUser, isLoading: syncLoading } = useQuery({
    queryKey: ['dbUser', user?.sub],
    queryFn: async () => {
      const res = await fetch('/auth/sync-user');
      if (!res.ok) throw new Error('Error al sincronizar');
      return res.json();
    },
    enabled: !!user, 
  });

  useEffect(() => {
    if (!authLoading && !syncLoading && dbUser) {
      const isOnboardingPage = pathname === '/onboarding';

      if (!dbUser.onboardingCompleted && !isOnboardingPage) {
        router.push('/onboarding');
      }

      if (dbUser.onboardingCompleted && isOnboardingPage) {
        router.push('/profile');
      }
    }
  }, [dbUser, authLoading, syncLoading, pathname, router]);

  return {
    user,
    dbUser,
    isLoading: authLoading || (!!user && syncLoading),
    isAuthenticated: !!user,
  };
}