"use client";
import { useEffect, useState } from "react";

const isDevelopment = process.env.NODE_ENV === "development";
const isMswEnabled = process.env.NEXT_PUBLIC_ENABLE_MSW === "true";

let workerStarted = false;
let workerStartPromise: Promise<void> | null = null;

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    if (!isDevelopment || !isMswEnabled) {
      const handleDisabledMsw = async () => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
          try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
              if (
                registration.active &&
                registration.active.scriptURL.includes("mockServiceWorker.js")
              ) {
                await registration.unregister();
              }
            }
          } catch {
          }
        }
        setMswReady(true);
      };

      handleDisabledMsw();
      return;
    }

    const startMSW = async () => {
      if (workerStarted) {
        setMswReady(true);
        return;
      }

      if (!workerStartPromise) {
        workerStartPromise = (async () => {
          const { worker } = await import("./mocks/browser");

          await worker.start({
            onUnhandledRequest: "bypass",
            serviceWorker: {
              url: "/mockServiceWorker.js",
            },
          });

          workerStarted = true;
        })();
      }

      try {
        await workerStartPromise;
      } catch (error) {
        const msg = (error as Error)?.message ?? '';
        if (!msg.includes("reading 'active'")) {
          console.error("❌ MSW error:", error);
        }
      } finally {
        setMswReady(true);
      }
    };

    startMSW();
  }, []);

  if (!mswReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xl font-black uppercase tracking-widest text-foreground">
            Cargando
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}