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
  // Onboarding — avatar upload + user patch
  | 'AVATAR_401' | 'AVATAR_422' | 'AVATAR_500' | 'AVATAR_TIMEOUT' | 'AVATAR_NETWORK' | 'AVATAR_SLOW'
  | 'PATCH_401'  | 'PATCH_409'  | 'PATCH_500'  | 'PATCH_TIMEOUT'  | 'PATCH_NETWORK'
  // Create-post — post image upload, post creation, tag patch
  | 'UPLOAD_401' | 'UPLOAD_500' | 'UPLOAD_NETWORK' | 'UPLOAD_SLOW'
  | 'CREATE_401' | 'CREATE_500' | 'CREATE_NETWORK'
  | 'PATCH_TAGS_401' | 'PATCH_TAGS_500' | 'PATCH_TAGS_NETWORK'
  // Edit-post — PATCH post, DELETE images, PATCH (append) images
  | 'PATCH_POST_401' | 'PATCH_POST_500' | 'PATCH_POST_NETWORK'
  | 'DELETE_IMAGE_401' | 'DELETE_IMAGE_500' | 'DELETE_IMAGE_NETWORK'
  | 'APPEND_IMAGE_401' | 'APPEND_IMAGE_500' | 'APPEND_IMAGE_NETWORK'
  // Sync-user errors (pre-navigation)
  | 'SYNC_USER_401' | 'SYNC_USER_403' | 'SYNC_USER_500' | 'SYNC_USER_503'
  // Gemini tag analysis
  | 'GEMINI_500'
  // Notifications — delete one, delete all
  | 'NOTIF_DELETE_500' | 'NOTIF_DELETE_ALL_500'
  // Seller rating
  | 'RATING_500';

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