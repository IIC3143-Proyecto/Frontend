import { usersHandlers } from "./users";
import { avatarHandlers } from "./avatar";
import { metroHandlers } from "./metros";
import { postHandlers } from "./posts";

export const handlers = [
  ...usersHandlers,
  ...avatarHandlers,
  ...metroHandlers,
  ...postHandlers,
];
