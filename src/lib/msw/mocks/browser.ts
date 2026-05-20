import { setupWorker } from 'msw/browser';
import { handlers } from './handlers/index';
import { setErrorScenario, resetErrorScenario, setMockUser, resetMockUser } from './scenario';

export const worker = setupWorker(...handlers);

const MSW_ENABLED = process.env.NEXT_PUBLIC_ENABLE_MSW === 'true';

if (typeof window !== 'undefined' && MSW_ENABLED) {
  (window as any).__setErrorScenario = setErrorScenario;
  (window as any).__resetErrorScenario = resetErrorScenario;
  (window as any).__setMockUser = setMockUser;
  (window as any).__resetMockUser = resetMockUser;
}
