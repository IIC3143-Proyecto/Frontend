"use client";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-3xl font-semibold">Iniciar sesión</h1>
      <p className="max-w-md text-center text-sm text-slate-600">
        Serás redirigido a Auth0 para iniciar sesión con tus credenciales.
      </p>
      <a href="/api/auth/login" className="rounded-md bg-slate-900 px-5 py-3 text-white hover:bg-slate-700">
        Iniciar sesión con Auth0
      </a>
    </main>
  );
}
