"use client";

import type { ReactNode } from "react";
import { Auth0Provider, useUser } from "@auth0/nextjs-auth0/client";

export function AuthProvider({ children }: { children: ReactNode }) {
  return <Auth0Provider>{children}</Auth0Provider>;
}

export function useAuth() {
  return useUser();
}
