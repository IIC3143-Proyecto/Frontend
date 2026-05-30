import { syncUserHandlers } from './sync-user';
import { usersHandlers } from './users';
import { avatarHandlers } from './avatar';
import { metroHandlers } from './metros';

export const handlers = [
  ...usersHandlers,
  ...avatarHandlers,
  ...metroHandlers,
  ...syncUserHandlers,
];