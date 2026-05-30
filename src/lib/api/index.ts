// remote(path) → real backend when NEXT_PUBLIC_API_URL set + MSW off; else relative (MSW intercepts)
// local(path)  → always a Next.js route handler (BFF, stub, or static data)
//
// To promote a "not ready" endpoint to real backend:
//   change local() → remote() and delete the stub handler under src/app/api/

const useMSW = process.env.NEXT_PUBLIC_ENABLE_MSW === 'true';
const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '';

function remote(path: string): string {
  return !useMSW && apiBase ? `${apiBase}${path}` : path;
}

function local(path: string): string {
  return path;
}

export const api = {
  syncUser:      () => local('/auth/sync-user'),                   // BFF — always local
  tags:          () => remote('/api/tag'),                         // backend #39
  metroStations: () => local('/api/metro/stations'),               // frontend-only, never in backend
  user:          (id: string) => local(`/api/user/${id}`),        // backend #46 — not ready
  userImage:     (id: string) => remote(`/api/image/user/${id}`), // backend #16
  post:          () => remote('/api/post'),                        // backend #19/#20
  postImages:    (id: string) => remote(`/api/image/post/${id}`), // backend #16
  postTags:      (id: string) => local(`/api/post/${id}/tags`),   // backend #48 — not ready
};
