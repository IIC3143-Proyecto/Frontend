'use client';
import { LogIn, UserPlus, ShoppingBag, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@auth0/nextjs-auth0/client'; // Importante

export function Navbar() {
  const { user, isLoading } = useUser();

  if (isLoading) return <div className="h-16" />; // Skeleton o vacío mientras carga

  return (
    <nav className="w-full border-b-4 border-black bg-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="font-black text-2xl tracking-tighter italic flex items-center gap-2">
          <ShoppingBag size={28} /> VTRNA
        </div>
        
        <div className="flex gap-4">
          {user ? (
            // VISTA LOGUEADO
            <>
              <a href="/profile">
                <Button variant="outline" className="border-2 border-black gap-2 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <User size={18} /> MI PERFIL
                </Button>
              </a>
              <a href="/auth/logout">
                <Button className="bg-red-500 text-white border-2 border-black gap-2 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <LogOut size={18} /> SALIR
                </Button>
              </a>
            </>
          ) : (
            // VISTA INVITADO
            <>
              <a href="/auth/login">
                <Button variant="outline" className="border-2 border-black gap-2 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <LogIn size={18} /> LOGIN
                </Button>
              </a>
              <a href="/auth/login?screen_hint=signup">
                <Button className="bg-black text-white gap-2 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
                  <UserPlus size={18} /> SIGNUP
                </Button>
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}