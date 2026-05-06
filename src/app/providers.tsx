'use client';

import { MSWProvider } from '@/lib/msw/msw-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Auth0Provider } from '@auth0/nextjs-auth0'; // Auth0 v4 import
import { useState } from 'react';
import { AuthWrapper } from '@/components/auth/auth-wrapper'; // The sync logic we discussed

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <MSWProvider>
        <Auth0Provider>
          <AuthWrapper>
            {children}
          </AuthWrapper>
        </Auth0Provider>
      </MSWProvider>
    </QueryClientProvider>
  );
}