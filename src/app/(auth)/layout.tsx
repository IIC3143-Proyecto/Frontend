export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header>auth header</header>
      <main>
        {children}
      </main>
    </div>
  );
}