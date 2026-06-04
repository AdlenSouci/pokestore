import { useState, useEffect } from 'react';
import { HomePage } from './Pages/Home/HomePage';
import { Shop } from './Pages/Shop';
import { Layout } from './components/Layout';
import { CardDetailModal } from './components/CardDetailModal';
import { AuthModal } from './components/AuthModal';
import { ProfilePage } from './components/ProfilePage';
import { CartPage } from './components/CartPage';
import { OrdersPage } from './components/OrdersPage';
import { type Product } from './types/product';
import { authService } from './services/auth.service';
import { cartService } from './services/cart.service';

type Page = 'home' | 'shop';

function App() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [authModalType, setAuthModalType] = useState<'login' | 'signup' | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentSessionId, setPaymentSessionId] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');
      const payment = urlParams.get('payment');
      const sessionId = urlParams.get('session_id');

      // Retour depuis Stripe
      if (payment === 'success') {
        setShowOrders(true);
        setPaymentSuccess(true);
        setPaymentSessionId(sessionId);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (payment === 'cancelled') {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (error) {
        setGoogleError(decodeURIComponent(error));
        setAuthModalType('login');
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (token) {
        try {
          console.log('🔐 Google callback - Token reçu:', token.substring(0, 20) + '...');
          const user = await authService.handleGoogleCallback(token);
          console.log('👤 Utilisateur récupéré:', user);
          console.log('💾 Token dans localStorage après callback:', localStorage.getItem('token') ? 'OUI ✅' : 'NON ❌');
          setUser({ name: user.name, email: user.email });
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          console.error('Erreur lors de la connexion Google:', err);
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
    console.log('🚪 LOGOUT appelé - Token avant:', localStorage.getItem('access_token') ? 'OUI' : 'NON');
    authService.logout();
    console.log('🚪 LOGOUT terminé - Token après:', localStorage.getItem('access_token') ? 'OUI' : 'NON');
    setUser(null);
    setCurrentPage('home');
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
  const handleCartClick = () => {
    console.log('🛒 Ouverture du panier - Token:', localStorage.getItem('access_token') ? 'OUI ✅' : 'NON ❌');
    setShowCart(true);
  };
  const handleCloseCart = () => setShowCart(false);
  const handleOrdersClick = () => setShowOrders(true);
  const handleCloseOrders = () => setShowOrders(false);
  const handleProfileUpdate = () => {
    const currentUser = authService.getUser();
    if (currentUser) {
      setUser({ name: currentUser.name, email: currentUser.email });
    }
  };
  const handleNavigateToHome = () => setCurrentPage('home');
  const handleNavigateToShop = () => setCurrentPage('shop');
  const handleAddToCart = async (product: Product) => {
    console.log('🛒 Tentative d\'ajout au panier:', product.name);
    console.log('👤 Utilisateur connecté:', user);
    console.log('🔑 Token dans localStorage:', localStorage.getItem('access_token') ? 'OUI' : 'NON');

    // Vérifier si l'utilisateur est connecté
    if (!user) {
      console.log('❌ Utilisateur non connecté, ouverture du modal');
      setAuthModalType('login');
      return;
    }

    try {
      // Convertir l'ID en nombre si c'est une chaîne
      const cardId = typeof product.id === 'string' ? parseInt(product.id) : product.id;
      console.log('📦 Ajout de la carte ID:', cardId);

      await cartService.addToCart(cardId, 1);
      console.log('✅ Article ajouté au panier');

      await loadCartCount();
      console.log('✅ Compteur mis à jour');
    } catch (err: any) {
      console.error('❌ Erreur lors de l\'ajout au panier:', err);
      console.error('Message d\'erreur:', err.message);

      // Si erreur d'authentification, demander de se connecter
      if (err.message.includes('401') || err.message.includes('Unauthorized') || err.message.includes('panier')) {
        console.log('🔐 Erreur d\'authentification détectée');
        setAuthModalType('login');
      } else {
        // Afficher l'erreur à l'utilisateur
        alert(`Erreur: ${err.message}`);
      }
    }
  };
  const loadCartCount = async () => {
    try {
      const cart = await cartService.getCart();
      setCartCount(cart.items.length);
    } catch (err) {
      console.error('Erreur lors du chargement du panier:', err);
    }
  };
  const handleCheckoutSuccess = () => {
    setShowCart(false);
    setShowOrders(true);
    loadCartCount();
  };
  const handleViewCard = (product: Product) => { setSelectedProduct(product); };
  const handleCloseModal = () => { setSelectedProduct(null); };

  // Charger le nombre d'articles au démarrage si connecté
  useEffect(() => {
    if (user) {
      loadCartCount();
    }
  }, [user]);

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
          onStartGame={handleNavigateToShop} cartItemsCount={cartCount} onCartClick={handleCartClick}
          onLoginClick={handleLoginClick} onSignupClick={handleSignupClick} user={user}
          onLogout={handleLogout} onNavigateToHome={handleNavigateToHome} onNavigateToShop={handleNavigateToShop}
          onProfileClick={handleProfileClick} onOrdersClick={handleOrdersClick}
        />
      ) : (
        <Layout
          cartItemsCount={cartCount} onCartClick={handleCartClick} onLoginClick={handleLoginClick}
          onSignupClick={handleSignupClick} user={user} onLogout={handleLogout}
          onNavigateToHome={handleNavigateToHome} onNavigateToShop={handleNavigateToShop}
          onProfileClick={handleProfileClick} onOrdersClick={handleOrdersClick}
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