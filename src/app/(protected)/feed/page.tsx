'use client';

export default function FeedPage() {
  // Ya no necesitas el useEffect de redirección aquí
  // El AuthRedirectWrapper en providers.tsx se encarga de esto
  
  return (
    <div className="p-8">
      <h1 className="text-4xl font-black italic tracking-tighter">EL FEED DE VTRNA</h1>
      {/* Contenido del feed */}
    </div>
  );
}