import type { UserDto } from './user';

// BFF returns UserDto directly — status is the canonical onboarding signal
export type SyncUserResponse = UserDto;
