"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <Link
        href="/login"
        className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold text-lg"
      >
        Iniciar sesión
      </Link>
    </main>
  );
}
