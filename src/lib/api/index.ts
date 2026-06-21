// remote(path) → real backend when NEXT_PUBLIC_API_URL set + MSW off; else relative (MSW intercepts)
// local(path)  → always the Next.js BFF route handler (e.g. /sync-user)

import { BASE } from './base';

const useMSW = process.env.NEXT_PUBLIC_ENABLE_MSW === 'true';

function remote(path: string): string {
  return !useMSW && BASE ? `${BASE}${path}` : path;
}

function local(path: string): string {
  return path;
}

export const api = {
  syncUser:           () => local('/sync-user'),                        // BFF — always local
  tags:               () => remote('/api/tag'),
  userImage:          (id: string) => remote(`/api/image/user/${id}`),
  user:               (id: string) => remote(`/api/user/${id}`),
  userTags:           (id: string) => remote(`/api/tag/user/${id}`),
  userTagsOnboarding: () => remote('/api/tag/user/onboarding'),
  savedPosts:         (id: string) => remote(`/api/post/saved/${id}`),
  interaction:        (postId: string) => remote(`/api/interaction/${postId}`),
  post:               () => remote('/api/post'),
  postImages:         (id: string) => remote(`/api/image/post/${id}`),
  offer:              () => remote('/api/offer'),
  postById:           (id: string) => remote(`/api/post/${id}`),
  feed:               () => remote('/api/post/feed'),
  search:             () => remote('/api/post/search'),
  sellerRating:       (id: string) => remote(`/api/seller/rating/${id}`),
};
