export default function MainAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header>main-app header</header>
      <main>
        {children}
      </main>
    </div>
  );
}