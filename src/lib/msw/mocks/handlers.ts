import { http, HttpResponse } from 'msw';
import { getMockUser } from './scenario';

type MockUser = {
  id: string;
  username: string;
  photoUrl: string | null;
  onboardingCompleted: boolean;
};

const USERS: Record<string, MockUser> = {
  FULL: {
    id: "user_123",
    username: "Flo_Full",
    photoUrl: "https://vtrna.com/avatar.jpg",
    onboardingCompleted: true,
  },
  NO_PHOTO: {
    id: "user_123",
    username: "Flo_Sin_Foto",
    photoUrl: null,
    onboardingCompleted: true,
  },
  ONBOARDING_PENDING: {
    id: "user_123",
    username: "Flo_Pendiente",
    photoUrl: "https://vtrna.com/avatar.jpg",
    onboardingCompleted: false,
  },
  NEW: {
    id: "user_123",
    username: "Flo_Nuevo",
    photoUrl: null,
    onboardingCompleted: false,
  },
};

export const handlers = [
  http.get('*/api/users/me', () => {
    const scenario = getMockUser();
    return HttpResponse.json(USERS[scenario]);
  }),

  http.patch('*/api/users/me', async ({ request }) => {
    const data = await request.json();

    const scenario = getMockUser();
    const baseUser = USERS[scenario];

    const updated =
      typeof data === 'object' && data !== null
        ? { ...baseUser, ...data }
        : baseUser;

    return HttpResponse.json(updated);
  }),
];