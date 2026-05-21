'use client';

import { useAuth } from '@/hooks/use-auth';
import { usePathname } from 'next/navigation';

const PUBLIC_ROUTES = ['/', '/about-us', '/faq'];

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading, syncError } = useAuth();
  const pathname = usePathname();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  if (syncError && syncError.code !== 401 && !isPublicRoute) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-black text-white gap-4">
        <p className="text-sm font-medium tracking-widest uppercase animate-pulse">
          Error al conectar con el servidor
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-xs text-white/60 hover:text-white underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (isLoading && !isPublicRoute) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-black text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent mb-4" />
        <p className="text-sm font-medium tracking-widest uppercase animate-pulse">
          Sincronizando con VTRNA...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
