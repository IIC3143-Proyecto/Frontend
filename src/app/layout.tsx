import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VTRNA",
  description: "Marketplace de Vitrinas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="es" className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}>
      <body className="min-h-full flex flex-col bg-white text-black">
        <Providers>
            <AuthRedirectWrapper>
                {children}
            </AuthRedirectWrapper>
        </Providers>
      </body>
    </html>
  );
}