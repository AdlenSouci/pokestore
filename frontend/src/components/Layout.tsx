import { type ReactNode } from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: ReactNode;
  cartItemsCount: number;
  onCartClick: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
  user: { name: string; email: string } | null;
  onLogout: () => void;
}

export function Layout({
  children,
  cartItemsCount,
  onCartClick,
  onLoginClick,
  onSignupClick,
  user,
  onLogout,
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#2d3561] text-white font-sans">
      <Navbar
        cartItemsCount={cartItemsCount}
        onCartClick={onCartClick}
        onLoginClick={onLoginClick}
        onSignupClick={onSignupClick}
        user={user}
        onLogout={onLogout}
      />
      <main className="flex-1 relative w-full">
        {children}
      </main>
    </div>
  );
}