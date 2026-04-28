import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";
import { MSWProvider } from "@/lib/msw/msw-provider";
import { setMockUser } from "@/lib/msw/mocks/scenario";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VTRNA",
  description: "Marketplace de Vitrinas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === 'development') {
    setMockUser('FULL');
    }
  return (
    <html lang="es" className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}>
      <body className="min-h-full flex flex-col bg-white text-black">
        {/* Auth0Provider (vía tu AuthProvider) va afuera */}
        <Providers>
          {/* MSWProvider va adentro */}
          <MSWProvider>
            {children}
          </MSWProvider>
        </Providers>
      </body>
    </html>
  );
}