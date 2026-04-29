import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await auth0.getSession(request);

  const isPrivateRoute = ['/feed', '/onboarding', '/complete-profile']
    .some(path => pathname.startsWith(path));


  if (!session && isPrivateRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (session && pathname === "/") {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  return auth0.middleware(request);
}