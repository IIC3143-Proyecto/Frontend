import { LoginForm } from "@/components/features/auth/login-form"

export default function LoginPage() {
  return (
    <main className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-background px-10 py-12">
      <h1 className="mb-12 text-center text-xl sm:text-2xl font-black uppercase tracking-tighter text-foreground">
        Log in
      </h1>
      <LoginForm />
      <a href="/api/auth/login" className="rounded-md bg-slate-900 px-5 py-3 text-white hover:bg-slate-700">
        Iniciar sesión con Auth0
      </a>
    </main>
  )
}