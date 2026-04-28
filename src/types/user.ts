export interface User {
  id: string;
  auth0Id?: string;
  email: string;
  name: string;
  username: string;
  bio?: string;
  photoUrl?: string | null;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserDto {
  username?: string;
  bio?: string;
  photoUrl?: string | null;
  onboardingCompleted?: boolean;
}