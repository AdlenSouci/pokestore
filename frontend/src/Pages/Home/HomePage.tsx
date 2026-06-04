import { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { SEO } from '../../components/SEO';
import './HomePage.css';

interface HomePageProps {
  onStartGame: () => void;
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

export function HomePage({
  onStartGame,
  cartItemsCount,
  onCartClick,
  onLoginClick,
  onSignupClick,
  onProfileClick,
  onOrdersClick,
  user,
  onLogout,
  onNavigateToHome,
  onNavigateToShop
}: HomePageProps) {
  const [showPressStart, setShowPressStart] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowPressStart((prev) => !prev);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout
      cartItemsCount={cartItemsCount}
      onCartClick={onCartClick}
      onLoginClick={onLoginClick}
      onSignupClick={onSignupClick}
      onProfileClick={onProfileClick}
      onOrdersClick={onOrdersClick}
      user={user}
      onLogout={onLogout}
      onNavigateToHome={onNavigateToHome}
      onNavigateToShop={onNavigateToShop}
    >
      <SEO
        title="Accueil"
        description="PokéCard Store – Achetez et collectionnez les meilleures cartes Pokémon rares en ligne. Livraison rapide, paiement sécurisé."
        url="https://pokecardstore.com"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'PokéCard Store',
          url: 'https://pokecardstore.com',
          description: 'Boutique en ligne de cartes Pokémon rares',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://pokecardstore.com/shop?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        }}
      />
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center relative overflow-hidden">

        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full star-twinkle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-4 w-full max-w-4xl mx-auto flex flex-col items-center">

          <div className="mb-12 animate-bounce-slow">
            <h1 className="text-5xl md:text-8xl text-[#7ec8a3] mb-4 pixel-font text-stroke-title">
              ⚡ POKÉCARD ⚡
            </h1>
            <h2 className="text-3xl md:text-4xl text-white pixel-font text-stroke-subtitle">
              STORE
            </h2>
          </div>

          <div className="mb-12 flex justify-center">
            <div className="relative w-32 h-32 animate-spin-slow">
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-red-500 to-red-600 border-8 border-[#2d3561]" />
              <div className="absolute bottom-0 left-0 right-0 h-16 rounded-b-full bg-gradient-to-b from-white to-gray-200 border-8 border-t-0 border-[#2d3561]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border-8 border-[#2d3561] z-10">
                <div className="absolute inset-2 rounded-full bg-gray-200" />
              </div>
              <div className="absolute top-1/2 left-0 right-0 h-2 bg-[#2d3561] -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-6 flex flex-col items-center w-full">
            <button
              onClick={onStartGame}
              className="group relative px-12 py-5 bg-[#7ec8a3] text-[#2d3561] rounded-2xl border-4 border-[#2d3561] hover:bg-[#6eb893] transition-all transform hover:scale-110 active:scale-95 shadow-xl"
            >
              <span className="text-2xl pixel-font font-bold">
                ▶ START GAME
              </span>
            </button>

            <div className="h-8">
              {showPressStart && (
                <p className="text-white text-xl pixel-font tracking-widest uppercase">
                  Press Start to Begin
                </p>
              )}
            </div>
          </div>


        </div>
      </div>
    </Layout>
  );
}