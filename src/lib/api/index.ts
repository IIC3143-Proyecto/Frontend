// remote(path) → real backend when NEXT_PUBLIC_API_URL set + MSW off; else relative (MSW intercepts)
// local(path)  → always the Next.js BFF route handler (e.g. /auth/sync-user)
//
// "not ready" endpoints (#46, #48) are in-function stubs in src/lib/api/ — no route handler needed.
// To promote when backend ships: replace the stub with a real fetch to remote().

import { BASE } from './base';

const useMSW = process.env.NEXT_PUBLIC_ENABLE_MSW === 'true';

function remote(path: string): string {
  return !useMSW && BASE ? `${BASE}${path}` : path;
}

function local(path: string): string {
  return path;
}

export const api = {
  syncUser:   () => local('/auth/sync-user'),                   // BFF — always local
  tags:       () => remote('/api/tag'),
  user:       (id: string) => remote(`/api/user/${id}`),
  userImage:  (id: string) => remote(`/api/image/user/${id}`),
  post:       () => remote('/api/post'),
  postImages: (id: string) => remote(`/api/image/post/${id}`),
};
