import { syncUserHandlers } from "./sync-user";
import { usersHandlers } from "./users";
import { avatarHandlers } from "./avatar";
import { postsHandlers } from "./posts";
import { offersHandlers } from "./offers";
import { tagsHandlers } from "./tags";
import { interactionHandlers } from "./interactions";
import { notificationsHandlers } from "./notifications";
import { ratingsHandlers } from "./ratings";
import { geminiHandlers } from "./gemini";

export const handlers = [
  ...usersHandlers,
  ...avatarHandlers,
  ...syncUserHandlers,
  ...postsHandlers,
  ...offersHandlers,
  ...tagsHandlers,
  ...interactionHandlers,
  ...notificationsHandlers,
  ...ratingsHandlers,
  ...geminiHandlers,
];
