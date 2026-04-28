import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="border-4 border-black p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-6xl font-black italic flex items-center gap-4">
          <ShoppingBag size={60} /> VTRNA
        </h1>
        <p className="mt-4 font-bold text-lg">MODO DESARROLLO ACTIVO</p>
        <button className="mt-8 bg-black text-white px-6 py-3 flex items-center gap-2 font-bold hover:invert">
          EXPLORAR VITRINAS <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}