export default function PublicInfoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header>public-info header</header>
      <main>
        {children}
      </main>
    </div>
  );
}