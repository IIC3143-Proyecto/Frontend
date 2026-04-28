'use client';
import { ArrowRight, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

export default function CompleteProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-black mb-8 uppercase tracking-widest">
        Complete Profile
      </h1>

      <Button
        className="flex items-center gap-3 bg-black text-white p-8 text-xl font-bold hover:scale-105 transition-transform"
        onClick={async () => {
          console.log('➡️ PATCH profile');

          await fetch('/api/users/me', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              photoUrl: 'https://i.pravatar.cc/300',
            }),
          });

          // 🔥 CLAVE: invalidar cache
          await queryClient.invalidateQueries({ queryKey: ['me'] });

          console.log('➡️ redirect → /onboarding');

          router.push('/onboarding');
        }}
      >
        <UserCircle size={24} />
        CONFIGURAR AHORA
        <ArrowRight size={24} />
      </Button>
    </div>
  );
}