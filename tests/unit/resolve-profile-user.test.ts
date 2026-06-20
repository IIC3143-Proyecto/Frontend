import { describe, it, expect } from 'vitest';
import {
  MOCK_USERS,
  MOCK_OTHER_USERS,
  resolveProfileUser,
} from '@/lib/msw/mocks/data/mock-users';

const currentUser = MOCK_USERS.FULL;

describe('resolveProfileUser', () => {
  it('devuelve el propio usuario cuando el id pedido es el suyo', () => {
    expect(resolveProfileUser(currentUser.id, currentUser)).toBe(currentUser);
  });

  it('devuelve el tercero conocido cuando el id corresponde a otro usuario', () => {
    const result = resolveProfileUser('auth0|other_456', currentUser);
    expect(result).toBe(MOCK_OTHER_USERS['auth0|other_456']);
    expect(result.id).not.toBe(currentUser.id);
  });

  it('cae en un tercero por defecto cuando el id es desconocido', () => {
    const result = resolveProfileUser('auth0|inexistente', currentUser);
    expect(result.id).not.toBe(currentUser.id);
    expect(result.id).toBe('auth0|other_456');
  });
});
