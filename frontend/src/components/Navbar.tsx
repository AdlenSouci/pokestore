import { ShoppingCart, LogOut } from 'lucide-react';

interface NavbarProps {
  cartItemsCount: number;
  onCartClick: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
  user: { name: string; email: string } | null;
  onLogout: () => void;
}

export function Navbar({
  cartItemsCount,
  onCartClick,
  onLoginClick,
  onSignupClick,
  user,
  onLogout,
}: NavbarProps) {
  return (
    <nav className="bg-gradient-to-r from-[#5a4f99] via-[#8b7ec8] to-[#2d3561] text-white shadow-2xl sticky top-0 z-50 border-b-4 border-[#2d3561]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-xl md:text-2xl pixel-font tracking-tighter cursor-pointer hover:scale-105 transition-transform">
              ⚡ PokéCard
            </h1>
            <div className="hidden md:flex gap-6 font-bold text-sm">
              <a href="#" className="hover:text-[#7ec8a3] transition-colors uppercase">Boutique</a>
              <a href="#" className="hover:text-[#7ec8a3] transition-colors uppercase">Collections</a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right leading-tight">
                  <p className="text-[10px] uppercase opacity-80">Dresseur</p>
                  <p className="text-sm font-bold">{user.name}</p>
                </div>
                <button onClick={onLogout} className="p-2 hover:bg-[#7b6eb8] rounded-xl transition-all">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                 <button onClick={onLoginClick} className="px-3 py-1 bg-[#2d3561] hover:bg-[#3d4571] rounded-lg border-2 border-[#1d2551] text-xs font-bold uppercase transition-all hover:scale-105">
                  Connexion
                </button>
                <button onClick={onSignupClick} className="px-3 py-1 bg-[#7ec8a3] text-[#2d3561] rounded-lg border-2 border-[#2d3561] text-xs font-bold uppercase hover:bg-[#6eb893] transition-all hover:scale-105">
                  Inscription
                </button>
              </div>
            )}

            <button onClick={onCartClick} className="relative p-2 hover:bg-[#7b6eb8] rounded-xl transition-all group">
              <ShoppingCart className="w-6 h-6 group-hover:text-[#7ec8a3]" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ff5555] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#2d3561]">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}