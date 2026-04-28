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