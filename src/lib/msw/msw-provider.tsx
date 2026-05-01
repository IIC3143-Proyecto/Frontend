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
        console.error("❌ MSW error:", error);
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
