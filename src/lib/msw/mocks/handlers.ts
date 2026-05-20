import { usersHandlers } from './handlers/users';
import { metroHandlers } from './handlers/metros';
import { avatarHandlers } from './handlers/avatar';

export const handlers = [
  ...usersHandlers,
  ...metroHandlers,
  ...avatarHandlers,
];