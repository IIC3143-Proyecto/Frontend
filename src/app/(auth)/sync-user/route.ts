import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { BASE } from '@/lib/api/base';
import { getUser } from '@/lib/api/user';
import { syncUserFromBackend } from '@/lib/api/auth';

export async function GET() {
  let tokenResult;
  try {
    tokenResult = await auth0.getAccessToken();
  } catch {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  if (!tokenResult?.token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (!BASE) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const session = await auth0.getSession();
  const dbUserId = (session?.user as { dbUserId?: string })?.dbUserId;

  let user;
  try {
    user = dbUserId
      ? await getUser(dbUserId, tokenResult.token)
      : await syncUserFromBackend(tokenResult.token);
  } catch (err) {
    const errStatus = (err as { status?: number }).status;
    // 404 on getUser means stale dbUserId (e.g. DB was reset) — fall back to sync
    if (errStatus === 404 && dbUserId) {
      try {
        user = await syncUserFromBackend(tokenResult.token);
      } catch (syncErr) {
        const status = (syncErr as { status?: number }).status ?? 500;
        return NextResponse.json({ error: 'Backend error' }, { status });
      }
    } else {
      return NextResponse.json({ error: 'Backend error' }, { status: errStatus ?? 500 });
    }
  }

  if (session) {
    await auth0.updateSession({
      ...session,
      user: { ...session.user, status: user.status, dbUserId: user.id },
    });
  }

  return NextResponse.json(user);
}
