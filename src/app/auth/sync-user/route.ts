import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';

export async function GET() {
  const tokenResult = await auth0.getAccessToken();
  if (!tokenResult?.token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const res = await fetch(`${backendUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${tokenResult.token}` },
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Backend error' }, { status: res.status });
  }

  return NextResponse.json(await res.json());
}
