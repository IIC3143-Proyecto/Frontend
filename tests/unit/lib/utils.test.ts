import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatRelativeDate } from '@/lib/utils';

describe('formatRelativeDate', () => {
  const NOW = new Date('2026-06-19T12:00:00');

  beforeEach(() => vi.setSystemTime(NOW));
  afterEach(() => vi.useRealTimers());

  test('devuelve formato relativo según la distancia temporal', () => {
    expect(formatRelativeDate(new Date(NOW.getTime() - 30_000).toISOString())).toBe('Ahora');
    expect(formatRelativeDate(new Date(NOW.getTime() - 45 * 60_000).toISOString())).toBe('Hace 45 min');
    expect(formatRelativeDate(new Date(NOW.getTime() - 3 * 3_600_000).toISOString())).toBe('Hace 3 h');
    expect(formatRelativeDate(new Date('2026-06-18T23:59:00').toISOString())).toBe('Ayer');
    expect(formatRelativeDate(new Date(NOW.getTime() - 3 * 86_400_000).toISOString())).toBe('Hace 3 días');
  });

  test('devuelve fecha en locale es-CL para fechas de más de 7 días', () => {
    const result = formatRelativeDate(new Date(NOW.getTime() - 8 * 86_400_000).toISOString());
    expect(result).not.toMatch(/^(Ahora|Hace|Ayer)/);
    expect(result).toMatch(/11/);
  });
});
