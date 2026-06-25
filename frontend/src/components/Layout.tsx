import { type ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PokemonBackground } from './animations/PokemonBackground';

interface LayoutProps {
  children: ReactNode;
  cartItemsCount: number;
  onCartClick: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onProfileClick?: () => void;
  onOrdersClick?: () => void;
  user: { name: string; email: string } | null;
  onLogout: () => void;
  onNavigateToHome: () => void;
  onNavigateToShop: () => void;
}

export function Layout({
  children,
  cartItemsCount,
  onCartClick,
  onLoginClick,
  onSignupClick,
  onProfileClick,
  onOrdersClick,
  user,
  onLogout,
  onNavigateToHome,
  onNavigateToShop,
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col text-white font-sans relative overflow-x-hidden">
      <PokemonBackground intensity="subtle" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar
          cartItemsCount={cartItemsCount}
          onCartClick={onCartClick}
          onOrdersClick={onOrdersClick}
          onLoginClick={onLoginClick}
          onSignupClick={onSignupClick}
          onProfileClick={onProfileClick}
          user={user}
          onLogout={onLogout}
          onNavigateToHome={onNavigateToHome}
          onNavigateToShop={onNavigateToShop}
        />
        <main className="flex-1 relative w-full">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
