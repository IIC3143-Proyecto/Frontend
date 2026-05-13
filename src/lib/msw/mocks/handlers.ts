import { usersHandlers } from './handlers/users';
import { metroHandlers } from './handlers/metros';
import { avatarHandlers } from './handlers/avatar';

/**
 * Centralized MSW handlers
 * 
 * Combines all mock handlers from individual handler modules:
 * - User endpoints (users.ts)
 * - Metro endpoints (metros.ts)
 * - Avatar upload (avatar.ts)
 */
export const handlers = [
  ...userHandlers,
  ...metroHandlers,
  ...avatarHandlers,
];