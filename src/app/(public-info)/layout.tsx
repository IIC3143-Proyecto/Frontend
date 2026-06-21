import { PublicNavbar } from "@/components/layout/public-navbar";

export default function PublicInfoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNavbar />
      <main className="flex-1">{children}</main>
    </>
  );
}