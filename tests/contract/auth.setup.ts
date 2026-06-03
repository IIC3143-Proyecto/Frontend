import { test as setup } from '@playwright/test';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const TOKEN_FILE = path.join(__dirname, '.auth/token.json');

setup('obtain contract access token', async ({ request }) => {
  const res = await request.get('/api/test/access-token');
  if (!res.ok) {
    setup.skip(true, `access-token endpoint returned ${res.status}`);
    return;
  }
  const body = await res.json().catch(() => null) as { token: string | null } | null;
  const token = body?.token ?? null;
  if (!token) {
    setup.skip(true, 'No active session — run with AUTH0_TEST_EMAIL/PASSWORD');
    return;
  }
  await mkdir(path.dirname(TOKEN_FILE), { recursive: true });
  await writeFile(TOKEN_FILE, JSON.stringify({ token }));
});
