import { syncUserHandlers } from "./sync-user";
import { usersHandlers } from "./users";
import { avatarHandlers } from "./avatar";
import { postsHandlers } from "./posts";
import { tagsHandlers } from "./tags";
import { notificationsHandlers } from "./notifications";

export const handlers = [
  ...usersHandlers,
  ...avatarHandlers,
  ...syncUserHandlers,
  ...postsHandlers,
  ...tagsHandlers,
  ...notificationsHandlers,
];
