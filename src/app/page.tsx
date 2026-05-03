"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const { mutate, isPending, isSuccess, isError, error } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/health`);
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      return res.json();
    },
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-24">
      <Link
        href="/login"
        className="text-black font-black uppercase underline tracking-widest"
      >
        Ir al Login
      </Link>
      <button
        onClick={() => mutate()}
        disabled={isPending}
        className="rounded bg-black px-4 py-2 text-white"
      >
        {isPending ? "Checkeando..." : "Health Check"}
      </button>
      {isSuccess && <p className="text-green-600">API OK</p>}
      {isError && <p className="text-red-600">{error.message}</p>}
    </main>
  );
}
