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
    id: "auth0|full_123",
    username: "Flo_Full",
    photoUrl: "https://vtrna.com/avatar.jpg",
    onboardingCompleted: true,
  },
  NO_PHOTO: {
    id: "auth0|no_photo_123",
    username: "Flo_Sin_Foto",
    photoUrl: null,
    onboardingCompleted: true,
  },
  ONBOARDING_PENDING: {
    id: "auth0|pending_123",
    username: "Flo_Pendiente",
    photoUrl: "https://vtrna.com/avatar.jpg",
    onboardingCompleted: false,
  },
  NEW: {
    id: "auth0|new_123",
    username: "Flo_Nuevo",
    photoUrl: null,
    onboardingCompleted: false,
  },
};

export const handlers = [
  http.get('*/auth/profile', () => {
    const scenario = getMockUser();
    const user = USERS[scenario];

    if (!user) return new HttpResponse(null, { status: 401 });

    return HttpResponse.json({
      sub: user.id,
      nickname: user.username,
      name: user.username,
      picture: user.photoUrl,
      email: `${user.username.toLowerCase()}@vtrna.cl`,
      email_verified: true,
    });
  }),

  http.get('*/auth/sync-user', () => {
    const scenario = getMockUser();
    const user = USERS[scenario];

    if (!user) return new HttpResponse(null, { status: 401 });

    return HttpResponse.json({
      id: user.id, 
      username: user.username,
      email: `${user.username.toLowerCase()}@vtrna.cl`,
      onboardingCompleted: user.onboardingCompleted,
      name: user.username,
      providerId: user.id, 
    });
  }),

  http.get('*/auth/logout', () => {
    return new HttpResponse(null, { 
      status: 302, 
      headers: { Location: '/' } 
    });
  }),
];