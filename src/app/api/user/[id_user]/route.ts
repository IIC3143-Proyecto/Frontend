import { NextRequest, NextResponse } from 'next/server';

// Stub for PATCH /api/user/:id_user — backend issue #46 (not yet implemented)
// When backend #46 lands: delete this file and change api.user() from local() → remote()
export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json(body, { status: 200 });
}
