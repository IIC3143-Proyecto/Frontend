'use client';
import { ShoppingBag, LogOut, User, PlusSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function AppNavbar() {
  return (
    <nav className="w-full border-b-4 border-black bg-white p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        
          <a href="/auth/logout">
            <Button 
              variant="outline" 
              className="border-2 border-black gap-2 font-bold text-red-600 hover:bg-red-50 shadow-[4px_4px_0px_0px_rgba(255,0,0,0.2)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
            >
              <LogOut size={18} /> <span className="hidden sm:inline">SALIR</span>
            </Button>
          </a>
      </div>
    </nav>
  );
}