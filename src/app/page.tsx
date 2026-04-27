// Ejemplo rápido para tu page.tsx
import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { Link } from 'lucide-react';

export default async function Page() {
  const auth0 = new Auth0Client();
  const session = await auth0.getSession();

  if (!session) return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Link href="/api/auth/login" className="text-black font-black uppercase underline tracking-widest">
        Ir al Login
      </Link>
    </main>)
  return (
    <div>
      <h1>Bienvenido, {session.user.name}</h1>
      <a href="/login">Cerrar sesión</a>
    </div>
  );
}