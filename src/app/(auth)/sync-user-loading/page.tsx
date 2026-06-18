'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthLoading() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raw = searchParams.get('redirectTo') ?? '/';
  // Restrict to same-origin paths — reject absolute URLs and protocol-relative paths
  const redirectTo = /^\/(?!\/)/.test(raw) ? raw : '/';

  useEffect(() => {
    fetch('/sync-user')
      .then(res => {
        if (!res.ok) throw new Error(`sync-user ${res.status}`);
        // '/' is the landing page — send authenticated users to the feed instead
        router.replace(redirectTo === '/' ? '/feed' : redirectTo);
      })
      .catch(() => router.replace('/feed'));
  }, [redirectTo, router]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-black text-white">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent mb-4" />
      <p className="text-sm font-medium tracking-widest uppercase animate-pulse">
        Sincronizando con VTRNA...
      </p>
    </div>
  );
}
