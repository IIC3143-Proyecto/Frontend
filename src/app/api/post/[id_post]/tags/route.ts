import { NextRequest, NextResponse } from 'next/server';
import { mockPostDto } from '@/lib/msw/mocks/data/mock-post';

// Stub for PATCH /api/post/:id_post/tags — backend issue #48 (not yet implemented)
// When backend #48 lands: delete this file and change api.postTags() from local() → remote()
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id_post: string }> }
) {
  const { id_post } = await params;
  return NextResponse.json(mockPostDto(id_post), { status: 200 });
}
