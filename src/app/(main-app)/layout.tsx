import { PrivateNavbar } from "@/components/layout/private-navbar";

export default function MainAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PrivateNavbar />
      <main className="flex-1">{children}</main>
    </>
  );
}