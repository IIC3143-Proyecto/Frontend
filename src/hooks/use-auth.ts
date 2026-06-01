import { useUser } from '@auth0/nextjs-auth0';
import { useQuery } from '@tanstack/react-query';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { syncUser } from '@/lib/api/auth';

export type SyncError = Error & { code: number };

type DbUser = { id: string; onboardingCompleted: boolean };

export function useAuth() {
  const { user, isLoading: authLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const { data: dbUser, isLoading: syncLoading, error: syncError } = useQuery<DbUser, SyncError>({
    queryKey: ['dbUser', user?.sub],
    queryFn: async () => {
      const data = await syncUser();
      return {
        ...data,
        onboardingCompleted: data.onboardingCompleted ?? false,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: (count, error) => error.code === 401 ? false : count < 2,
  });

  useEffect(() => {
    if (!authLoading && !syncLoading && dbUser) {
      const isOnboardingPage = pathname === '/onboarding';

      if (!dbUser.onboardingCompleted && !isOnboardingPage) {
        router.push('/onboarding');
      }

      if (dbUser.onboardingCompleted && isOnboardingPage) {
        router.push('/posts');
      }
    }
  }, [dbUser, authLoading, syncLoading, pathname, router]);

  return {
    user,
    dbUser,
    isLoading: authLoading || (!!user && syncLoading),
    isAuthenticated: !!user,
    syncError,
  };
}
