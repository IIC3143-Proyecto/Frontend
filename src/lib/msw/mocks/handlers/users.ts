import { http, HttpResponse, delay } from 'msw';
import { getMockUser, getErrorScenario } from '../scenario';

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

let currentUser: MockUser = { ...USERS[getMockUser()] };

export const usersHandlers = [
  http.get('*/user', () => {
    const scenario = getMockUser();
    if (currentUser.id !== USERS[scenario].id) {
      currentUser = { ...USERS[scenario] };
    }
    return HttpResponse.json(currentUser);
  }),

  http.patch('*/user', async ({ request }) => {
    const scenario = getErrorScenario();

    if (scenario === 'PATCH_401') {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (scenario === 'PATCH_409') {
      return HttpResponse.json({ message: 'Username already taken', field: 'username' }, { status: 409 });
    }
    if (scenario === 'PATCH_500') {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
    if (scenario === 'PATCH_TIMEOUT') {
      await delay('infinite');
    }
    if (scenario === 'PATCH_NETWORK') {
      return HttpResponse.error();
    }

    const token = request.headers.get('Authorization');
    if (!token) {
        return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
        );
    }

    const data = await request.json();
    if (!data || typeof data !== 'object') {
        return HttpResponse.json(
        { message: 'Invalid request body' },
        { status: 400 }
        );
    }

    if (typeof data === 'object' && data !== null) {
        currentUser = { ...currentUser, ...(data as Partial<MockUser>) };
    }
    return HttpResponse.json(currentUser, { status: 200 });
    })
];