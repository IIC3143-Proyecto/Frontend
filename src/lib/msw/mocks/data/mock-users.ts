import type { SyncUserResponse } from '@/lib/types/auth';
import { type MockUserScenario } from '../scenario';


export const MOCK_USERS: Record<MockUserScenario, SyncUserResponse> = {
  FULL: {
    id: 'auth0|full_123',
    name: 'Flo Full',
    username: 'Flo_Full',
    email: 'flo_full@vtrna.cl',
    providerAuth0: 'auth0|full_123',
    bio: 'Bio completa del usuario',
    photoUrl: 'https://vtrna.com/avatars/full.webp',
    status: 'Activo',
    createdAtUtcMinus3: '2025-01-01T00:00:00.000Z',
    updatedAtUtcMinus3: '2025-01-01T00:00:00.000Z',
    posts: [],
    interactions: [],
  },
  NO_PHOTO: {
    id: 'auth0|no_photo_123',
    name: 'Flo Sin Foto',
    username: 'Flo_Sin_Foto',
    email: 'flo_sin_foto@vtrna.cl',
    providerAuth0: 'auth0|no_photo_123',
    bio: 'Bio sin foto de perfil',
    status: 'Activo',
    createdAtUtcMinus3: '2025-01-01T00:00:00.000Z',
    updatedAtUtcMinus3: '2025-01-01T00:00:00.000Z',
    posts: [],
    interactions: [],
  },
  ONBOARDING_PENDING: {
    id: 'auth0|pending_123',
    name: 'Flo Pendiente',
    username: 'Flo_Pendiente',
    email: 'flo_pendiente@vtrna.cl',
    providerAuth0: 'auth0|pending_123',
    status: 'En proceso de registro',
    createdAtUtcMinus3: '2025-01-01T00:00:00.000Z',
    updatedAtUtcMinus3: '2025-01-01T00:00:00.000Z',
    posts: [],
    interactions: [],
  },
  NEW: {
    id: 'auth0|new_123',
    name: 'Flo Nuevo',
    username: 'Flo_Nuevo',
    email: 'flo_nuevo@vtrna.cl',
    providerAuth0: 'auth0|new_123',
    status: 'En proceso de registro',
    createdAtUtcMinus3: '2025-01-01T00:00:00.000Z',
    updatedAtUtcMinus3: '2025-01-01T00:00:00.000Z',
    posts: [],
    interactions: [],
  },
};

/**
 * Usuarios "terceros" — perfiles de otras personas que el usuario autenticado
 * puede visitar en `/profile/[id]`. La vista debe mostrarlos en solo lectura
 * (sin botones de edición, guardados ni cerrar sesión).
 *
 * Están indexados por id para que `GET /api/user/:id` pueda resolverlos.
 */
export const MOCK_OTHER_USERS: Record<string, SyncUserResponse> = {
  // Tercero "completo": foto, bio, zona y contacto. Buen caso para verificar
  // que toda la info básica se muestra sin opciones de edición.
  'auth0|other_456': {
    id: 'auth0|other_456',
    name: 'Vale Vecina',
    username: 'Vale_Vecina',
    email: 'vale_vecina@vtrna.cl',
    providerAuth0: 'auth0|other_456',
    bio: 'Vendo y arriendo cosas cerca del metro 🚇',
    photoUrl: 'https://vtrna.com/avatars/other.webp',
    contactInfo: {
      instagram: '@vale.vecina',
      whatsapp: '+56912345678',
      email: 'vale_vecina@vtrna.cl',
    },
    stations: ['L1_ECUADOR', 'L1_LAS_REJAS'],
    status: 'Activo',
    createdAtUtcMinus3: '2025-01-01T00:00:00.000Z',
    updatedAtUtcMinus3: '2025-01-01T00:00:00.000Z',
    posts: [],
    interactions: [],
  },
  // Tercero "mínimo": sin bio, sin contacto y sin zona. Verifica los estados
  // vacíos ("Sin zona definida", "Sin información de contacto").
  'auth0|other_789': {
    id: 'auth0|other_789',
    name: 'Tomi Tercero',
    username: 'Tomi_Tercero',
    email: 'tomi_tercero@vtrna.cl',
    providerAuth0: 'auth0|other_789',
    status: 'Activo',
    createdAtUtcMinus3: '2025-01-01T00:00:00.000Z',
    updatedAtUtcMinus3: '2025-01-01T00:00:00.000Z',
    posts: [],
    interactions: [],
  },
};

/** Tercero por defecto cuando el id solicitado no corresponde a uno conocido. */
const DEFAULT_OTHER_USER = MOCK_OTHER_USERS['auth0|other_456'];

/**
 * Decide qué usuario devuelve `GET /api/user/:id`:
 * - Si el id pedido es el del usuario autenticado → ese mismo (perfil propio).
 * - Si coincide con un tercero conocido → ese tercero.
 * - En cualquier otro caso → un tercero genérico por defecto.
 */
export function resolveProfileUser(
  requestedId: string,
  currentUser: SyncUserResponse,
): SyncUserResponse {
  if (requestedId === currentUser.id) return currentUser;
  return MOCK_OTHER_USERS[requestedId] ?? DEFAULT_OTHER_USER;
}
