"use client";

import * as React from "react";
import { OnboardingForm, type OnboardingFormData } from "@/components/onboarding/onboarding-form";

export default function TestPage() {
  const handleOnboardingSubmit = async (formData: OnboardingFormData) => {
    try {
      // Step 1: Upload avatar if provided
      if (formData.avatar) {
        const formDataObj = new FormData();
        formDataObj.append("avatar", formData.avatar);

        const avatarResponse = await fetch("/api/profile/avatar", {
          method: "POST",
          body: formDataObj,
        });

        if (!avatarResponse.ok) {
          const errorData = await avatarResponse.json();
          throw new Error(
            errorData.details || errorData.error || "Failed to upload avatar"
          );
        }
      }

      // Step 2: Update user profile (username and bio)
      const userUpdateResponse = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          bio: formData.bio,
        }),
      });

      if (!userUpdateResponse.ok) {
        const errorData = await userUpdateResponse.json();
        throw new Error(
          errorData.details || errorData.error || "Failed to update profile"
        );
      }

      // Success
      alert("Profile updated successfully!");
      console.log("Onboarding completed:", formData);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      throw new Error(message);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full">
        <OnboardingForm onSubmit={handleOnboardingSubmit} />
      </div>
    </main>
  );
}
