import { auth0 } from '@/lib/auth0';

export async function GET() {
  if (process.env.NODE_ENV !== 'development' || process.env.ENABLE_TEST_ENDPOINTS !== 'true') {
    return Response.json({ error: 'Not available' }, { status: 404 });
  }
  const tokenResult = await auth0.getAccessToken();
  return Response.json({ token: tokenResult?.token ?? null });
}
