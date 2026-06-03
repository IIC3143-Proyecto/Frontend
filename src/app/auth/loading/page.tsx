'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthLoading() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/';

  useEffect(() => {
    fetch('/auth/sync-user')
      .then(() => router.replace(next))
      .catch(() => router.replace('/'));
  }, [next, router]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-black text-white">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent mb-4" />
      <p className="text-sm font-medium tracking-widest uppercase animate-pulse">
        Sincronizando con VTRNA...
      </p>
    </div>
  );
}
