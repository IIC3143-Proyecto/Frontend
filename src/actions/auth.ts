"use server";

import { auth0 } from "@/lib/auth0";

export async function getAccessToken(): Promise<string> {
  if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_ENABLE_MSW === 'true') {
    return 'mock-access-token';
  }
  const { token } = await auth0.getAccessToken();
  return token;
}
