"use client";

import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { useAuth } from "@/hooks/use-auth";
export default function OnboardingPage() {
  const { dbUser } = useAuth();

  return (
    <main className="h-screen min-h-125 pb-15 flex flex-col bg-background p-4">
      <div className="w-full flex-1 min-h-0 h-full">
        <OnboardingForm userId={dbUser?.id} />
      </div>
    </main>
  );
}
