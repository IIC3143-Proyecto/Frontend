import { setupWorker } from 'msw/browser';
import { handlers } from './handlers/index';
import { setErrorScenario, resetErrorScenario, setMockUser, resetMockUser } from './scenario';
import { resetNotifications } from './handlers/notifications';
import type { NotificationDto } from '@/lib/types/notification';

export const worker = setupWorker(...handlers);

const MSW_ENABLED = process.env.NEXT_PUBLIC_ENABLE_MSW === 'true';

type WindowWithMSW = Window & {
  __setErrorScenario: typeof setErrorScenario;
  __resetErrorScenario: typeof resetErrorScenario;
  __setMockUser: typeof setMockUser;
  __resetMockUser: typeof resetMockUser;
  __resetNotifications: (list?: NotificationDto[]) => void;
};

if (typeof window !== 'undefined' && MSW_ENABLED) {
  const w = window as unknown as WindowWithMSW;
  w.__setErrorScenario = setErrorScenario;
  w.__resetErrorScenario = resetErrorScenario;
  w.__setMockUser = setMockUser;
  w.__resetMockUser = resetMockUser;
  w.__resetNotifications = resetNotifications;
}
