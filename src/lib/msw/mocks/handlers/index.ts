import { syncUserHandlers } from "./sync-user";
import { usersHandlers } from "./users";
import { avatarHandlers } from "./avatar";
import { postsHandlers } from "./posts";
import { tagsHandlers } from "./tags";
import { interactionHandlers } from "./interactions";

export const handlers = [
  ...usersHandlers,
  ...avatarHandlers,
  ...syncUserHandlers,
  ...postsHandlers,
  ...tagsHandlers,
  ...interactionHandlers,
];
