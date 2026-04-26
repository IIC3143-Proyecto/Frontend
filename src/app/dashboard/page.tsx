import { auth0 } from "@/lib/auth0";

export default async function DashboardPage() {
  const session = await auth0.getSession();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-3xl font-semibold">Dashboard protegido</h1>
      <p className="max-w-xl text-center text-sm text-slate-600">
        Esta ruta está protegida por Auth0 y la middleware del proyecto.
      </p>
      <pre className="w-full max-w-3xl overflow-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-100">
        {JSON.stringify(session, null, 2)}
      </pre>
      <a href="/api/auth/logout" className="rounded-md bg-red-600 px-5 py-3 text-white hover:bg-red-500">
        Cerrar sesión
      </a>
    </main>
  );
}
