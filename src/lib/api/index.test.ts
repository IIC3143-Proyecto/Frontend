import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('api URL builder', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('syncUser() siempre retorna la ruta BFF local', async () => {
    const { api } = await import('./index');
    expect(api.syncUser()).toBe('/sync-user');
  });

  it('tags() retorna ruta relativa cuando MSW está activo', async () => {
    vi.stubEnv('NEXT_PUBLIC_ENABLE_MSW', 'true');
    const { api } = await import('./index');
    expect(api.tags()).toBe('/api/tag');
  });

  it('tags() retorna URL absoluta cuando hay BASE y MSW desactivado', async () => {
    vi.stubEnv('NEXT_PUBLIC_ENABLE_MSW', 'false');
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.com');
    const { api } = await import('./index');
    expect(api.tags()).toBe('https://api.example.com/api/tag');
  });

  it('userImage("abc") incluye el id en la URL', async () => {
    vi.stubEnv('NEXT_PUBLIC_ENABLE_MSW', 'true');
    const { api } = await import('./index');
    expect(api.userImage('abc')).toContain('abc');
  });

  it('postImages("xyz") incluye el id en la URL', async () => {
    vi.stubEnv('NEXT_PUBLIC_ENABLE_MSW', 'true');
    const { api } = await import('./index');
    expect(api.postImages('xyz')).toContain('xyz');
  });
});
