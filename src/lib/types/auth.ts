import type { UserDto } from './user';

// BFF adds onboardingCompleted derived from UserDto.bio
export type SyncUserResponse = UserDto & {
  onboardingCompleted: boolean;
};
