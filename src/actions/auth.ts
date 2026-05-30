"use server";

import { auth0 } from "@/lib/auth0";

export async function getAccessToken(): Promise<string> {
  const { token } = await auth0.getAccessToken();
  return token;
}
