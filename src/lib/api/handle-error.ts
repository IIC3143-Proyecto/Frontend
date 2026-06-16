import { toast } from "sonner";

export function handleApiError(
  err: unknown,
  label: string,
  router: { push: (url: string) => void },
) {
  const status = (err as { status?: number }).status;
  const message = err instanceof Error ? err.message : `Error en ${label}`;
  if (status === undefined) {
    toast.error("Error de red", { description: "Verifica tu conexión e inténtalo de nuevo." });
  } else if (status === 401) {
    router.push("/session-expired");
  } else {
    toast.error(label, { description: message });
  }
}
