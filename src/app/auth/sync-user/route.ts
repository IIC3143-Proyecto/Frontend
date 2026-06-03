import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { BASE } from '@/lib/api/base';
import type { UserDto } from '@/lib/types/user';
import type { SyncUserResponse } from '@/lib/types/auth';

export async function GET() {
  const tokenResult = await auth0.getAccessToken();
  if (!tokenResult?.token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (!BASE) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const res = await fetch(`${BASE}/api/auth/sync-user`, {
    headers: { Authorization: `Bearer ${tokenResult.token}` },
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Backend error' }, { status: res.status });
  }

  type BackendSyncResponse = { data: UserDto; message: string; onboardingCompleted: boolean; status: string };
  const { data: user } = await res.json() as BackendSyncResponse;

  const response: SyncUserResponse = {
    ...user,
    onboardingCompleted: !!user.bio,
  };

  // Persiste onboardingCompleted en la sesión para que proxy.ts lo lea server-side
  const session = await auth0.getSession();
  if (session) {
    await auth0.updateSession({
      ...session,
      user: { ...session.user, onboardingCompleted: response.onboardingCompleted },
    });
  }

  return NextResponse.json(response);
}
