import { setupWorker } from 'msw/browser';
import { handlers } from './handlers/index';
import { setErrorScenario, resetErrorScenario, setMockUser, resetMockUser } from './scenario';

export const worker = setupWorker(...handlers);

const MSW_ENABLED = process.env.NEXT_PUBLIC_ENABLE_MSW === 'true';

type WindowWithMSW = Window & {
  __setErrorScenario: typeof setErrorScenario;
  __resetErrorScenario: typeof resetErrorScenario;
  __setMockUser: typeof setMockUser;
  __resetMockUser: typeof resetMockUser;
};

if (typeof window !== 'undefined' && MSW_ENABLED) {
  const w = window as unknown as WindowWithMSW;
  w.__setErrorScenario = setErrorScenario;
  w.__resetErrorScenario = resetErrorScenario;
  w.__setMockUser = setMockUser;
  w.__resetMockUser = resetMockUser;
}
