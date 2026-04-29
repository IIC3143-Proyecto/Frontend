# MSW (Mock Service Worker)

Esta carpeta contiene la capa de simulación de backend usada en desarrollo.

---

## Propósito

Se usa para:
- Simular `/api/users/me`
- Simular `PATCH /api/users/me`
- Probar flujos de autenticación y onboarding

---

## Archivos

### `mocks/browser.ts`
Inicializa el worker de MSW.

### `mocks/handlers.ts`
Define endpoints fake del backend.

### `mocks/scenario.ts`
Define qué tipo de usuario se está simulando:
- FULL
- NO_PHOTO
- ONBOARDING_PENDING
- NEW

Permite cambiar el estado del usuario simulado de forma controlada en desarrollo.

### `msw-provider.tsx`
Inicia MSW en runtime de Next.js (solo en desarrollo).

---

## Reglas importantes

- No iniciar `worker.start()` fuera del provider
- No usar MSW para lógica de UI
- No mutar estado global arbitrariamente fuera de handlers  
  (se permite mutación controlada a través de `scenario.ts` para testing en desarrollo)
- MSW solo simula el network layer

---

## Endpoints simulados

- `GET /api/users/me`
- `PATCH /api/users/me`

---

## Cómo cambiar el usuario simulado (MSW Scenarios)

El usuario que devuelve MSW se controla desde `scenario.ts`.

Esto permite simular distintos estados del usuario sin tocar el backend.

### Archivo `src/lib/msw/mocks/scenario.ts`

```ts
export type MockUserScenario =
  | 'FULL'
  | 'NO_PHOTO'
  | 'ONBOARDING_PENDING'
  | 'NEW';

let currentScenario: MockUserScenario = 'FULL';

/**
 * Cambia el usuario simulado globalmente
 * (solo afecta desarrollo con MSW activo)
 */
export function setMockUser(scenario: MockUserScenario) {
  currentScenario = scenario;
}

/**
 * Retorna el escenario actual activo
 */
export function getMockUser(): MockUserScenario {
  return currentScenario;
}

/**
 * Resetea al usuario por defecto (FULL)
 */
export function resetMockUser() {
  currentScenario = 'FULL';
}
}
```

## Importante

- Esto solo funciona en desarrollo (`NODE_ENV=development`)
- MSW intercepta `api/users/me`
- El cambio afecta toda la app inmediatamente (no requiere refresh si el handler lee el estado en runtime)

## Como funciona internamente

UI → fetch('/api/users/me')
        ↓
MSW intercepta request
        ↓
handlers.ts consulta scenario.ts
        ↓
devuelve usuario simulado