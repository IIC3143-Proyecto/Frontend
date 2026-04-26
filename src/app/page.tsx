// Ejemplo rápido para tu page.tsx
import { Auth0Client } from '@auth0/nextjs-auth0/server';

export default async function Page() {
  const auth0 = new Auth0Client();
  const session = await auth0.getSession();

  if (!session) return <a href="/api/auth/login">Ingresar</a>;

  return (
    <div>
      <h1>Bienvenido, {session.user.name}</h1>
      <a href="/api/auth/logout">Cerrar sesión</a>
    </div>
  );
}