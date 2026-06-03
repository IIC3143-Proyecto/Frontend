import { auth0 } from '@/lib/auth0';
import { MOCK_USERS } from '@/lib/msw/mocks/data/mock-users';
import type { MockUserScenario } from '@/lib/msw/mocks/scenario';

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'Not available' }, { status: 404 });
  }

  const { scenario } = await req.json() as { scenario?: MockUserScenario };
  const mockUser = MOCK_USERS[scenario ?? 'FULL'];

  const session = await auth0.getSession();
  if (!session) {
    return Response.json({ error: 'No active session to update' }, { status: 401 });
  }

  await auth0.updateSession({
    ...session,
    user: { ...session.user, ...mockUser },
  });

  return Response.json({ ok: true });
}
