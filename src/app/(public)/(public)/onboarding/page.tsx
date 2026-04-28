'use client';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

export default function OnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <h1 className="text-3xl font-black mb-8 uppercase italic">
        Onboarding
      </h1>

      <Button
        className="flex items-center gap-2 bg-white text-black font-black p-6 hover:bg-gray-200"
        onClick={async () => {
          console.log('➡️ PATCH onboarding');

          await fetch('/api/users/me', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ onboardingCompleted: true }),
          });

          // 🔥 CLAVE
          await queryClient.invalidateQueries({ queryKey: ['me'] });

          console.log('➡️ redirect → /feed');

          router.push('/feed');
        }}
      >
        <CheckCircle2 size={20} />
        ENTRAR A VTRNA
      </Button>
    </div>
  );
}