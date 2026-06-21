import { describe, it, expect } from 'vitest';
import { desktopToMobile, mobileToDesktop } from '@/lib/post-steps';

describe('desktopToMobile', () => {
  it('step 1 sin fotos → móvil step 1', () => expect(desktopToMobile(1, 0)).toBe(1));
  it('step 1 con fotos → móvil step 2', () => expect(desktopToMobile(1, 1)).toBe(2));
  it('step 2 → móvil step 3', () => expect(desktopToMobile(2, 0)).toBe(3));
  it('step 3 → móvil step 4', () => expect(desktopToMobile(3, 0)).toBe(4));
  it('paso desconocido → móvil step 1', () => expect(desktopToMobile(99, 0)).toBe(1));
});

describe('mobileToDesktop', () => {
  it('móvil step 3 → desktop step 2', () => expect(mobileToDesktop(3)).toBe(2));
  it('móvil step 4 → desktop step 3', () => expect(mobileToDesktop(4)).toBe(3));
  it('móvil step 5 → desktop step 3', () => expect(mobileToDesktop(5)).toBe(3));
  it('paso desconocido → desktop step 1', () => expect(mobileToDesktop(99)).toBe(1));
});
