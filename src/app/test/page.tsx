"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { CreatePostModal } from "@/components/create-post/create-post-modal";

export default function TestPage() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-xl font-semibold">Prueba del formulario</h1>
      <Button onClick={() => setIsOpen(true)}>Nueva Publicación</Button>
      <CreatePostModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </main>
  );
}
