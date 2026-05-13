import { http, HttpResponse } from 'msw';
import { getMockUser } from '../scenario';

type MockUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  photoUrl: string | null;
  onboardingCompleted: boolean;
  contact_info: {
    phone: string;
    email: string;
    instagram: string;
  };
  age: number | null;
};

const USERS: Record<string, MockUser> = {
  FULL: {
    id: "user_123",
    name: "",
    username: "Flo_Full",
    email: "",
    bio: "",
    photoUrl: "https://vtrna.com/avatar.jpg",
    onboardingCompleted: true,
    contact_info: { phone: "", email: "", instagram: "" },
    age: null,
  },
  NO_PHOTO: {
    id: "user_123",
    name: "",
    username: "Flo_Sin_Foto",
    email: "",
    bio: "",
    photoUrl: null,
    onboardingCompleted: true,
    contact_info: { phone: "", email: "", instagram: "" },
    age: null,
  },
  ONBOARDING_PENDING: {
    id: "user_123",
    name: "",
    username: "Flo_Pendiente",
    email: "",
    bio: "",
    photoUrl: "https://vtrna.com/avatar.jpg",
    onboardingCompleted: false,
    contact_info: { phone: "", email: "", instagram: "" },
    age: null,
  },
  NEW: {
    id: "user_123",
    name: "",
    username: "Flo_Nuevo",
    email: "",
    bio: "",
    photoUrl: null,
    onboardingCompleted: false,
    contact_info: { phone: "", email: "", instagram: "" },
    age: null,
  },
};

// In-memory state so PATCH persists within the same session
let currentUser: MockUser = { ...USERS[getMockUser()] };

export const usersHandlers = [
  http.get('*/api/users/me', () => {
    const scenario = getMockUser();
    // Reset if scenario changed
    if (currentUser.id !== USERS[scenario].id) {
      currentUser = { ...USERS[scenario] };
    }
    return HttpResponse.json(currentUser);
  }),

  http.patch('*/api/users/me', async ({ request }) => {
    const data = await request.json();
    if (typeof data === 'object' && data !== null) {
      currentUser = { ...currentUser, ...(data as Partial<MockUser>) };
    }
    return HttpResponse.json(currentUser);
  }),
];