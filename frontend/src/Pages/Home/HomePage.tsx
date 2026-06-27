import { Layout } from '../../components/Layout';
import { SEO } from '../../components/SEO';
import { PokemonBackground } from '../../components/animations/PokemonBackground';
import { BattleAnim } from '../../components/animations/BattleAnim';
import { Logo } from '../../components/Logo';
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
  onNavigateToCollection: () => void;
  onNavigateToContact: () => void;
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
  onNavigateToShop,
  onNavigateToCollection,
  onNavigateToContact,
}: HomePageProps) {
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
      onNavigateToCollection={onNavigateToCollection}
      onNavigateToContact={onNavigateToContact}
    >
      <SEO
        title="Accueil"
        description="PokéStore – Achetez et collectionnez des cartes Pokémon rares. Filtres par série, extension et prix."
        url="https://pokestore-hazel.vercel.app"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'PokéStore',
          url: 'https://pokestore-hazel.vercel.app',
          description: 'Boutique en ligne de cartes Pokémon',
        }}
      />

      <section className="relative min-h-[calc(100vh-64px)] overflow-hidden">
        <PokemonBackground intensity="full" />

        <div className="relative z-10 container mx-auto px-4 py-12 md:py-20 flex flex-col items-center text-center max-w-4xl">
          <div className="mb-8">
            <Logo size="hero" className="justify-center" />
          </div>

          <p className="text-[#7ec8a3] text-sm md:text-base font-sans font-semibold tracking-widest uppercase mb-3 animate-fade-in">
            Boutique de cartes Pokémon
          </p>

          <p className="text-[#c4b5fd] text-base md:text-lg font-sans mb-8 max-w-xl leading-relaxed">
            Parcours notre catalogue, filtre par prix, série ou extension, et complète ta collection en
            quelques clics.
          </p>

          <div className="w-full max-w-md mb-10">
            <BattleAnim size="hero" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-14">
            <button
              type="button"
              onClick={onStartGame}
              className="px-10 py-4 bg-[#7ec8a3] text-[#1a1f3a] rounded-xl border-4 border-[#2d3561] font-bold text-lg hover:bg-[#6eb893] transition transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-[#7ec8a3]/30"
            >
              Voir la boutique
            </button>
            <button
              type="button"
              onClick={onNavigateToShop}
              className="px-10 py-4 bg-transparent text-white rounded-xl border-4 border-[#5a4f99] font-bold text-lg hover:bg-white/10 transition hover:border-[#7ec8a3]/60"
            >
              Découvrir le catalogue
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full text-left">
            {[
              { title: 'Catalogue filtré', desc: 'Prix, année, série et extension', emoji: '🃏' },
              { title: 'Paiement sécurisé', desc: 'Stripe & commandes suivies', emoji: '💳' },
              { title: 'Disponible mobile', desc: 'App Android et site responsive', emoji: '📱' },
            ].map((item, i) => (
              <div
                key={item.title}
                className="rounded-2xl border-2 border-[#5a4f99]/50 bg-white/5 backdrop-blur-sm p-5 transition hover:border-[#7ec8a3]/50 hover:bg-white/10 hover:-translate-y-1"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <span className="text-2xl mb-2 block" aria-hidden="true">{item.emoji}</span>
                <h3 className="text-[#7ec8a3] font-bold font-sans mb-1">{item.title}</h3>
                <p className="text-[#a5b4fc] text-sm font-sans">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
