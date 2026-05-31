import { type MockUserScenario } from '../scenario';
import type { SyncUserResponse } from '@/lib/types/auth';

export type { SyncUserResponse };

export const MOCK_USERS: Record<MockUserScenario, SyncUserResponse> = {
  FULL: { id: 'auth0|full_123', username: 'Flo_Full', email: 'flo_full@vtrna.cl', onboardingCompleted: true, name: 'Flo_Full', providerId: 'auth0|full_123' },
  NO_PHOTO: { id: 'auth0|no_photo_123', username: 'Flo_Sin_Foto', email: 'flo_sin_foto@vtrna.cl', onboardingCompleted: true, name: 'Flo_Sin_Foto', providerId: 'auth0|no_photo_123' },
  ONBOARDING_PENDING: { id: 'auth0|pending_123', username: 'Flo_Pendiente', email: 'flo_pendiente@vtrna.cl', onboardingCompleted: false, name: 'Flo_Pendiente', providerId: 'auth0|pending_123' },
  NEW: { id: 'auth0|new_123', username: 'Flo_Nuevo', email: 'flo_nuevo@vtrna.cl', onboardingCompleted: false, name: 'Flo_Nuevo', providerId: 'auth0|new_123' },
};
