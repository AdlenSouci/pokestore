import { useState, useEffect } from 'react';
import { HomePage } from './Pages/Home/HomePage';
import { Shop } from './Pages/Shop';
import { Layout } from './components/Layout';
import { CardDetailModal } from './components/CardDetailModal';
import { AuthModal } from './components/AuthModal';
import { type Product } from './types/product';
import { supabase } from './lib/supabase';

type Page = 'home' | 'shop';

function App() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [authModalType, setAuthModalType] = useState<'login' | 'signup' | null>(null);

  // Synchronisation silencieuse (utile pour Google Login ou reload)
  const syncUserWithBackend = async (email: string, name: string) => {
    try {
      await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      // Pas de console.log ni d'alert, on reste discret
    } catch (err) {
      console.error("Erreur sync backend (silencieux):", err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const name = session.user.user_metadata.full_name || 'Dresseur';
        const email = session.user.email || '';
        setUser({ name, email });
        syncUserWithBackend(email, name);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const name = session.user.user_metadata.full_name || 'Dresseur';
        const email = session.user.email || '';
        setUser({ name, email });
        // On synchronise aussi ici pour être sûr (Upsert gère les doublons)
        syncUserWithBackend(email, name);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); setCurrentPage('home'); };
  const handleLoginClick = () => setAuthModalType('login');
  const handleSignupClick = () => setAuthModalType('signup');
  const handleCloseAuthModal = () => setAuthModalType(null);
  const handleCartClick = () => setCartCount(prev => prev + 1);
  const handleNavigateToHome = () => setCurrentPage('home');
  const handleNavigateToShop = () => setCurrentPage('shop');
  const handleAddToCart = (product: Product) => { setCartCount(prev => prev + 1); };
  const handleViewCard = (product: Product) => { setSelectedProduct(product); };
  const handleCloseModal = () => { setSelectedProduct(null); };

  return (
    <>
      <AuthModal type={authModalType} onClose={handleCloseAuthModal} onSuccess={() => setAuthModalType(null)} />

      {currentPage === 'home' ? (
        <HomePage 
          onStartGame={handleNavigateToShop} cartItemsCount={cartCount} onCartClick={handleCartClick}
          onLoginClick={handleLoginClick} onSignupClick={handleSignupClick} user={user}
          onLogout={handleLogout} onNavigateToHome={handleNavigateToHome} onNavigateToShop={handleNavigateToShop}
        />
      ) : (
        <Layout
          cartItemsCount={cartCount} onCartClick={handleCartClick} onLoginClick={handleLoginClick}
          onSignupClick={handleSignupClick} user={user} onLogout={handleLogout}
          onNavigateToHome={handleNavigateToHome} onNavigateToShop={handleNavigateToShop}
        >
          <Shop onAddToCart={handleAddToCart} onViewCard={handleViewCard} />
        </Layout>
      )}

      {selectedProduct && (
        <CardDetailModal product={selectedProduct} onClose={handleCloseModal} onAddToCart={handleAddToCart} />
      )}
    </>
  );
}

export default App;