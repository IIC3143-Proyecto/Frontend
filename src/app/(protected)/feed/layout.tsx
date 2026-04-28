import { AppNavbar } from "@/components/common/app-navbar";

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50"> 
      <AppNavbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}