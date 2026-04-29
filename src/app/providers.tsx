'use client';

import { Auth0Provider } from '@auth0/nextjs-auth0/client'; 
import { MSWProvider } from '@/lib/msw/msw-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

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
        <Auth0Provider>
            <MSWProvider>
            {children}
            </MSWProvider>
        </Auth0Provider>
    </QueryClientProvider>
  );
}
