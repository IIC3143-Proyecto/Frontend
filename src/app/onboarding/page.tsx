"use client";

import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { useAuth } from "@/hooks/use-auth";

export default function OnboardingPage() {
  const { dbUser } = useAuth();

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full">
        <OnboardingForm userId={dbUser?.id} />
      </div>
    </main>
  );
}
