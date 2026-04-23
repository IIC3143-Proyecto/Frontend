"use client"
import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Link href="/login" className="text-black font-black uppercase underline tracking-widest">
        Ir al Login
      </Link>
    </main>
  )
}