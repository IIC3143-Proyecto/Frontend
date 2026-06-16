import { syncUserHandlers } from "./sync-user";
import { usersHandlers } from "./users";
import { avatarHandlers } from "./avatar";
import { metroHandlers } from "./metros";
import { postsHandlers } from "./posts";
import { offersHandlers } from "./offers";
import { tagsHandlers } from "./tags";

export const handlers = [
  ...usersHandlers,
  ...avatarHandlers,
  ...metroHandlers,
  ...syncUserHandlers,
  ...postsHandlers,
  ...offersHandlers,
  ...tagsHandlers,
];
