import { BASE } from "./base";
import type { SyncUserResponse } from "@/lib/types/auth";
import type { UserDto } from "@/lib/types/user";

export async function syncUser(): Promise<SyncUserResponse> {
  const res = await fetch("/sync-user");
  if (res.status === 401) {
    throw Object.assign(new Error("AUTH_EXPIRED"), { code: 401 });
  }
  if (!res.ok) {
    throw Object.assign(new Error("SYNC_FAILED"), { code: res.status });
  }
  return res.json() as Promise<SyncUserResponse>;
}

export async function syncUserFromBackend(token: string): Promise<UserDto> {
  const res = await fetch(`${BASE}/api/auth/sync-user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok)
    throw Object.assign(new Error("BACKEND ERROR"), { status: res.status });
  const { data } = (await res.json()) as { data: UserDto; message: string };
  return data;
}
