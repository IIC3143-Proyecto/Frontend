import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { BASE } from '@/lib/api/base';

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

  const result = await res.json();
  const user = result.data ?? result;
  return NextResponse.json({
    ...user,
    onboardingCompleted: !!user.bio,
  });
}
