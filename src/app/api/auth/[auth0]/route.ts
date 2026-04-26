import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { NextRequest } from 'next/server';

// Forzamos la configuración para evitar el error de APP_BASE_URL
const auth0 = new Auth0Client({
  appBaseUrl: process.env.AUTH0_BASE_URL,
  domain: process.env.AUTH0_DOMAIN || process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '').replace('/', ''),
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
});

export async function GET(req: NextRequest, ctx: any) {
  try {
    const res = await auth0.middleware(req, ctx);
    
    // Si el middleware no sabe qué hacer con la ruta, forzamos el login
    if (res.headers.get('x-middleware-next') === '1') {
       return auth0.startInteractiveLogin(req, ctx);
    }
    
    return res;
  } catch (error) {
    console.error("Error en Auth0 Route:", error);
    // Si falla el middleware, intentamos el login directo como último recurso
    return auth0.startInteractiveLogin(req, ctx);
  }
}

export const POST = (req: NextRequest, ctx: any) => auth0.middleware(req, ctx);