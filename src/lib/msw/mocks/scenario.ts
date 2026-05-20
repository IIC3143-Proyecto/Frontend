export type MockUserScenario =
  | 'FULL'
  | 'NO_PHOTO'
  | 'ONBOARDING_PENDING'
  | 'NEW';

let currentScenario: MockUserScenario = 'FULL';

export function setMockUser(scenario: MockUserScenario) {
  currentScenario = scenario;
}

export function getMockUser(): MockUserScenario {
  return currentScenario;
}

export function resetMockUser() {
  currentScenario = 'FULL';
}

export type OnboardingErrorScenario =
  | 'NONE'
  | 'AVATAR_401'
  | 'AVATAR_422'
  | 'AVATAR_500'
  | 'AVATAR_TIMEOUT'
  | 'AVATAR_NETWORK'
  | 'AVATAR_SLOW'
  | 'PATCH_401'
  | 'PATCH_409'
  | 'PATCH_500'
  | 'PATCH_TIMEOUT'
  | 'PATCH_NETWORK';

let currentErrorScenario: OnboardingErrorScenario = 'NONE';

export function setErrorScenario(scenario: OnboardingErrorScenario) {
  currentErrorScenario = scenario;
}

export function getErrorScenario(): OnboardingErrorScenario {
  return currentErrorScenario;
}

export function resetErrorScenario() {
  currentErrorScenario = 'NONE';
}