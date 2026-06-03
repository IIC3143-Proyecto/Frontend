export function desktopToMobile(step: number, photoCount: number): number {
  switch (step) {
    case 1: return photoCount > 0 ? 2 : 1;
    case 2: return 3;
    case 3: return 4;
    default: return 1;
  }
}

export function mobileToDesktop(step: number): number {
  switch (step) {
    case 3: return 2;
    case 4:
    case 5: return 3;
    default: return 1;
  }
}
