import { NextResponse } from 'next/server';

// Stub for POST /api/image/user/:id_user — backend #16 is implemented but
// returns { message } while the onboarding form still expects { photoUrl }.
// When promoting api.userImage() from stub to remote():
//   1. Delete this file
//   2. In onboarding-form.tsx: replace reading photoUrl from response with
//      queryClient.invalidateQueries({ queryKey: ['dbUser'] })
export async function POST() {
  return NextResponse.json(
    { photoUrl: `https://vtrna.com/avatars/mock-${Date.now()}.webp` },
    { status: 201 }
  );
}
