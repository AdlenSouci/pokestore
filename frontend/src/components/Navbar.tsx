import { useState } from 'react';
import { ShoppingCart, LogOut, UserCircle, Package, Menu, X } from 'lucide-react';
import { PokeballIcon } from './PokeballIcon';

interface NavbarProps {
  cartItemsCount: number;
  onCartClick: () => void;
  onOrdersClick?: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onProfileClick?: () => void;
  user: { name: string; email: string } | null;
  onLogout: () => void;
  onNavigateToHome: () => void;
  onNavigateToShop: () => void;
}

export function Navbar({
  cartItemsCount,
  onCartClick,
  onOrdersClick,
  onLoginClick,
  onSignupClick,
  onProfileClick,
  user,
  onLogout,
  onNavigateToHome,
  onNavigateToShop,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleNavigateHome = () => {
    onNavigateToHome();
    closeMobileMenu();
  };

  const handleNavigateShop = () => {
    onNavigateToShop();
    closeMobileMenu();
  };

  const handleCartClick = () => {
    onCartClick();
    closeMobileMenu();
  };

  const handleProfileClick = () => {
    onProfileClick?.();
    closeMobileMenu();
  };

  const handleOrdersClick = () => {
    onOrdersClick?.();
    closeMobileMenu();
  };

  const handleLoginClick = () => {
    onLoginClick();
    closeMobileMenu();
  };

  const handleSignupClick = () => {
    onSignupClick();
    closeMobileMenu();
  };

  const handleLogout = () => {
    onLogout();
    closeMobileMenu();
  };

  return (
    <nav className="bg-gradient-to-r from-[#5a4f99] via-[#8b7ec8] to-[#2d3561] text-white shadow-2xl sticky top-0 z-50 border-b-4 border-[#2d3561]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4 md:gap-8">
            <button
              type="button"
              onClick={handleNavigateHome}
              className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform text-left"
              aria-label="Retour à l'accueil PokéStore"
            >
              <PokeballIcon size={28} />
              <span className="text-lg md:text-2xl pixel-font tracking-tighter">
                PokéStore
              </span>
            </button>
            <div className="hidden md:flex gap-6 font-bold text-sm">
              <button onClick={onNavigateToShop} className="hover:text-[#7ec8a3] transition-colors uppercase">
                Boutique
              </button>
              <button className="hover:text-[#7ec8a3] transition-colors uppercase cursor-not-allowed opacity-50">
                Collections
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right leading-tight">
                  <p className="text-[10px] uppercase opacity-80">Dresseur</p>
                  <p className="text-sm font-bold">{user.name}</p>
                </div>
                {onProfileClick && (
                  <button
                    onClick={onProfileClick}
                    aria-label="Mon profil"
                    className="p-2 hover:bg-[#7b6eb8] rounded-xl transition-all"
                  >
                    <UserCircle className="w-5 h-5" aria-hidden="true" />
                  </button>
                )}
                {onOrdersClick && (
                  <button
                    onClick={onOrdersClick}
                    aria-label="Mes commandes"
                    className="p-2 hover:bg-[#7b6eb8] rounded-xl transition-all"
                  >
                    <Package className="w-5 h-5" aria-hidden="true" />
                  </button>
                )}
                <button
                  onClick={onLogout}
                  aria-label="Se déconnecter"
                  className="p-2 hover:bg-[#7b6eb8] rounded-xl transition-all"
                >
                  <LogOut className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex gap-2">
                <button
                  onClick={onLoginClick}
                  className="px-3 py-1 bg-[#2d3561] hover:bg-[#3d4571] rounded-lg border-2 border-[#1d2551] text-xs font-bold uppercase transition-all hover:scale-105"
                >
                  Connexion
                </button>
                <button
                  onClick={onSignupClick}
                  className="px-3 py-1 bg-[#7ec8a3] text-[#2d3561] rounded-lg border-2 border-[#2d3561] text-xs font-bold uppercase hover:bg-[#6eb893] transition-all hover:scale-105"
                >
                  Inscription
                </button>
              </div>
            )}

            <button
              onClick={handleCartClick}
              aria-label={cartItemsCount > 0 ? `Panier, ${cartItemsCount} article${cartItemsCount > 1 ? 's' : ''}` : 'Panier'}
              className="relative p-2 hover:bg-[#7b6eb8] rounded-xl transition-all group"
            >
              <ShoppingCart className="w-6 h-6 group-hover:text-[#7ec8a3]" aria-hidden="true" />
              {cartItemsCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-[#ff5555] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#2d3561]"
                  aria-hidden="true"
                >
                  {cartItemsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2 hover:bg-[#7b6eb8] rounded-xl transition-all"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t-2 border-[#2d3561]/50 py-4 space-y-1">
            <button
              type="button"
              onClick={handleNavigateHome}
              className="w-full text-left px-3 py-3 rounded-xl hover:bg-[#7b6eb8]/40 font-bold uppercase text-sm transition-colors"
            >
              Accueil
            </button>
            <button
              type="button"
              onClick={handleNavigateShop}
              className="w-full text-left px-3 py-3 rounded-xl hover:bg-[#7b6eb8]/40 font-bold uppercase text-sm transition-colors"
            >
              Boutique
            </button>
            <button
              type="button"
              disabled
              className="w-full text-left px-3 py-3 rounded-xl font-bold uppercase text-sm opacity-50 cursor-not-allowed"
            >
              Collections
            </button>

            <div className="border-t border-[#2d3561]/40 my-2" />

            {user ? (
              <>
                <p className="px-3 py-1 text-xs uppercase opacity-70">Dresseur · {user.name}</p>
                {onProfileClick && (
                  <button
                    type="button"
                    onClick={handleProfileClick}
                    className="w-full text-left px-3 py-3 rounded-xl hover:bg-[#7b6eb8]/40 font-bold text-sm transition-colors flex items-center gap-2"
                  >
                    <UserCircle className="w-4 h-4" aria-hidden="true" />
                    Mon profil
                  </button>
                )}
                {onOrdersClick && (
                  <button
                    type="button"
                    onClick={handleOrdersClick}
                    className="w-full text-left px-3 py-3 rounded-xl hover:bg-[#7b6eb8]/40 font-bold text-sm transition-colors flex items-center gap-2"
                  >
                    <Package className="w-4 h-4" aria-hidden="true" />
                    Mes commandes
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-3 rounded-xl hover:bg-[#7b6eb8]/40 font-bold text-sm transition-colors flex items-center gap-2 text-[#ffb4b4]"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  Déconnexion
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 px-3 pt-1">
                <button
                  type="button"
                  onClick={handleLoginClick}
                  className="w-full py-2.5 bg-[#2d3561] hover:bg-[#3d4571] rounded-lg border-2 border-[#1d2551] text-xs font-bold uppercase transition-all"
                >
                  Connexion
                </button>
                <button
                  type="button"
                  onClick={handleSignupClick}
                  className="w-full py-2.5 bg-[#7ec8a3] text-[#2d3561] rounded-lg border-2 border-[#2d3561] text-xs font-bold uppercase hover:bg-[#6eb893] transition-all"
                >
                  Inscription
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
