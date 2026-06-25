import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { HomePage } from './Pages/Home/HomePage';
import { Shop } from './Pages/Shop';
import { Collection } from './Pages/Collection';
import { Contact } from './Pages/Contact';
import { Layout } from './components/Layout';
import { CardDetailModal } from './components/CardDetailModal';
import { AuthModal } from './components/AuthModal';
import { ProfilePage } from './components/ProfilePage';
import { CartPage } from './components/CartPage';
import { OrdersPage } from './components/OrdersPage';
import { type Product } from './types/product';
import { authService } from './services/auth.service';
import { cartService } from './services/cart.service';
import { type AppPage, navigateToPage, pathToPage } from './lib/navigation';

function App() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [currentPage, setCurrentPage] = useState<AppPage>(() => pathToPage(window.location.pathname));
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [authModalType, setAuthModalType] = useState<'login' | 'signup' | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentSessionId, setPaymentSessionId] = useState<string | null>(null);

  const goToPage = useCallback((page: AppPage) => {
    navigateToPage(page);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const onPopState = () => setCurrentPage(pathToPage(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');
      const payment = urlParams.get('payment');
      const sessionId = urlParams.get('session_id');

      const cleanUrl = () => {
        const page = pathToPage(window.location.pathname);
        const path = page === 'home' ? '/' : `/${page}`;
        window.history.replaceState({ page }, document.title, path);
      };

      if (payment === 'success') {
        setShowOrders(true);
        setPaymentSuccess(true);
        setPaymentSessionId(sessionId);
        cleanUrl();
      } else if (payment === 'cancelled') {
        cleanUrl();
      }

      if (error) {
        setGoogleError(decodeURIComponent(error));
        setAuthModalType('login');
        cleanUrl();
      } else if (token) {
        try {
          const loggedInUser = await authService.handleGoogleCallback(token);
          setUser({ name: loggedInUser.name, email: loggedInUser.email });
          cleanUrl();
        } catch (err) {
          console.error('Erreur lors de la connexion Google:', err);
          cleanUrl();
        }
        return;
      }

      const currentUser = authService.getUser();
      if (currentUser) {
        setUser({ name: currentUser.name, email: currentUser.email });
      }
    };

    initAuth();
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    goToPage('home');
  };
  const handleLoginClick = () => setAuthModalType('login');
  const handleSignupClick = () => setAuthModalType('signup');
  const handleCloseAuthModal = () => {
    setAuthModalType(null);
    setGoogleError(null);
  };
  const handleAuthSuccess = () => {
    const currentUser = authService.getUser();
    if (currentUser) {
      setUser({ name: currentUser.name, email: currentUser.email });
    }
    setAuthModalType(null);
  };
  const [showProfile, setShowProfile] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const handleProfileClick = () => setShowProfile(true);
  const handleCloseProfile = () => setShowProfile(false);
  const handleCartClick = () => setShowCart(true);
  const handleCloseCart = () => setShowCart(false);
  const handleOrdersClick = () => setShowOrders(true);
  const handleCloseOrders = () => setShowOrders(false);
  const handleProfileUpdate = () => {
    const currentUser = authService.getUser();
    if (currentUser) {
      setUser({ name: currentUser.name, email: currentUser.email });
    }
  };
  const handleNavigateToHome = () => goToPage('home');
  const handleNavigateToShop = () => goToPage('shop');
  const handleNavigateToCollection = () => goToPage('collection');
  const handleNavigateToContact = () => goToPage('contact');

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      setAuthModalType('login');
      return;
    }

    try {
      const cardId = typeof product.id === 'string' ? parseInt(product.id) : product.id;
      await cartService.addToCart(cardId, 1);
      toast.success(`${product.name} ajouté au panier`);
      await loadCartCount();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur';
      if (message.includes('401') || message.includes('Unauthorized') || message.includes('panier')) {
        setAuthModalType('login');
      } else {
        toast.error(message || "Erreur lors de l'ajout au panier");
      }
    }
  };

  const loadCartCount = async () => {
    try {
      const cart = await cartService.getCart();
      setCartCount(cart.items.length);
    } catch {
      /* non connecté */
    }
  };

  const handleCheckoutSuccess = () => {
    setShowCart(false);
    setShowOrders(true);
    loadCartCount();
  };
  const handleViewCard = (product: Product) => setSelectedProduct(product);
  const handleCloseModal = () => setSelectedProduct(null);

  useEffect(() => {
    if (user) loadCartCount();
  }, [user]);

  const layoutProps = {
    cartItemsCount: cartCount,
    onCartClick: handleCartClick,
    onLoginClick: handleLoginClick,
    onSignupClick: handleSignupClick,
    user,
    onLogout: handleLogout,
    onNavigateToHome: handleNavigateToHome,
    onNavigateToShop: handleNavigateToShop,
    onNavigateToCollection: handleNavigateToCollection,
    onNavigateToContact: handleNavigateToContact,
    onProfileClick: handleProfileClick,
    onOrdersClick: handleOrdersClick,
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'shop':
        return <Shop onAddToCart={handleAddToCart} onViewCard={handleViewCard} />;
      case 'collection':
        return (
          <Collection
            user={user}
            onLoginClick={handleLoginClick}
            onNavigateToShop={handleNavigateToShop}
            onViewCard={handleViewCard}
            onAddToCart={handleAddToCart}
          />
        );
      case 'contact':
        return <Contact />;
      default:
        return null;
    }
  };

  return (
    <>
      <AuthModal
        type={authModalType}
        onClose={handleCloseAuthModal}
        onSuccess={handleAuthSuccess}
        googleError={googleError}
      />
      {showProfile && <ProfilePage onClose={handleCloseProfile} onUpdate={handleProfileUpdate} />}
      {showCart && <CartPage onClose={handleCloseCart} onCheckout={handleCheckoutSuccess} />}
      {showOrders && (
        <OrdersPage
          onClose={handleCloseOrders}
          paymentSuccess={paymentSuccess}
          paymentSessionId={paymentSessionId}
        />
      )}

      {currentPage === 'home' ? (
        <HomePage
          onStartGame={handleNavigateToShop}
          cartItemsCount={cartCount}
          onCartClick={handleCartClick}
          onLoginClick={handleLoginClick}
          onSignupClick={handleSignupClick}
          user={user}
          onLogout={handleLogout}
          onNavigateToHome={handleNavigateToHome}
          onNavigateToShop={handleNavigateToShop}
          onNavigateToCollection={handleNavigateToCollection}
          onNavigateToContact={handleNavigateToContact}
          onProfileClick={handleProfileClick}
          onOrdersClick={handleOrdersClick}
        />
      ) : (
        <Layout {...layoutProps}>{renderPage()}</Layout>
      )}

      {selectedProduct && (
        <CardDetailModal
          product={selectedProduct}
          onClose={handleCloseModal}
          onAddToCart={handleAddToCart}
        />
      )}
    </>
  );
}

export default App;
