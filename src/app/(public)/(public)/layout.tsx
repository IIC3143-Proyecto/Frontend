import { Navbar } from "@/components/common/navbar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </>
  );
}