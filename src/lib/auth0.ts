import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { NextResponse } from 'next/server';

export const auth0 = new Auth0Client({
  authorizationParameters: {
    audience: process.env.AUTH0_AUDIENCE,
  },
  routes: {
    login: '/login',
    logout: '/logout',
    callback: '/callback',
  },
  async onCallback(error, ctx) {
    if (error) {
      console.error('[auth0] callback error:', error.message);
      return NextResponse.redirect(
        new URL('/login', ctx.appBaseUrl ?? process.env.AUTH0_BASE_URL!)
      );
    }
    return NextResponse.redirect(
      new URL(ctx.returnTo ?? '/', ctx.appBaseUrl ?? process.env.AUTH0_BASE_URL!)
    );
  },
});