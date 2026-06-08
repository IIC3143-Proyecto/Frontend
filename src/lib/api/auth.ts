import type { SyncUserResponse } from '@/lib/types/auth';

export async function syncUser(): Promise<SyncUserResponse> {
  const res = await fetch('/auth/sync-user');
  if (res.status === 401) {
    throw Object.assign(new Error('AUTH_EXPIRED'), { code: 401 });
  }
  if (!res.ok) {
    throw Object.assign(new Error('SYNC_FAILED'), { code: res.status });
  }
  return res.json() as Promise<SyncUserResponse>;
}
