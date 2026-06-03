import { auth0 } from '@/lib/auth0';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'Not available' }, { status: 404 });
  }
  const tokenResult = await auth0.getAccessToken();
  return Response.json({ token: tokenResult?.token ?? null });
}
