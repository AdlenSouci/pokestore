import { Github, Twitter, Instagram, Mail, MapPin, Shield, Truck, CreditCard } from 'lucide-react';
import { Logo } from './Logo';

interface FooterProps {
  onNavigateHome?: () => void;
  onNavigateShop?: () => void;
  onNavigateContact?: () => void;
}

function NavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  if (onClick) {
    return (
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
        className="hover:text-white transition-colors"
      >
        {children}
      </a>
    );
  }
  return (
    <a href={href} className="hover:text-white transition-colors">
      {children}
    </a>
  );
}

export function Footer({ onNavigateHome, onNavigateShop, onNavigateContact }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-gradient-to-b from-[#1a1f3a] to-[#0f1428] text-white border-t-4 border-[#5a4f99] relative z-10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Logo size="sm" onClick={onNavigateHome} className="mb-3" />
            <p className="text-sm text-[#a5b4fc] leading-relaxed font-sans">
              Boutique en ligne dédiée aux cartes Pokémon TCG. Trouve, collectionne et achète tes cartes préférées.
            </p>
          </div>

          <div>
            <h3 className="text-sm uppercase font-bold text-[#7ec8a3] mb-3 tracking-wider">Boutique</h3>
            <ul className="space-y-2 text-sm font-sans text-[#c4b5fd]">
              <li><NavLink href="/" onClick={onNavigateHome}>Accueil</NavLink></li>
              <li><NavLink href="/shop" onClick={onNavigateShop}>Boutique</NavLink></li>
              <li>
                <a
                  href="/#app-mobile"
                  onClick={(e) => {
                    e.preventDefault();
                    if (window.location.pathname === '/' || window.location.pathname === '') {
                      document.getElementById('app-mobile')?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      onNavigateHome?.();
                      setTimeout(() => {
                        document.getElementById('app-mobile')?.scrollIntoView({ behavior: 'smooth' });
                      }, 300);
                    }
                  }}
                  className="hover:text-white transition-colors"
                >
                  Application mobile
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm uppercase font-bold text-[#7ec8a3] mb-3 tracking-wider">Aide</h3>
            <ul className="space-y-2 text-sm font-sans text-[#c4b5fd]">
              <li><NavLink href="/contact" onClick={onNavigateContact}>Contact</NavLink></li>
              <li><a href="/faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="/livraison" className="hover:text-white transition-colors">Livraison</a></li>
              <li><a href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm uppercase font-bold text-[#7ec8a3] mb-3 tracking-wider">Suis-nous</h3>
            <div className="flex gap-3 mb-4">
              <span
                className="p-2 rounded-lg bg-[#2d3561] opacity-50 cursor-not-allowed"
                title="Twitter — bientôt disponible"
                aria-hidden="true"
              >
                <Twitter className="w-4 h-4" />
              </span>
              <span
                className="p-2 rounded-lg bg-[#2d3561] opacity-50 cursor-not-allowed"
                title="Instagram — bientôt disponible"
                aria-hidden="true"
              >
                <Instagram className="w-4 h-4" />
              </span>
              <a href="https://github.com/AdlenSouci/pokestore" aria-label="GitHub" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-[#2d3561] hover:bg-[#5a4f99] transition-colors">
                <Github className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
            <NavLink href="/contact" onClick={onNavigateContact}>
              <span className="text-sm font-sans text-[#a5b4fc] hover:text-white transition-colors flex items-center gap-2">
                <Mail className="w-4 h-4" aria-hidden="true" />
                adlenssouci03@gmail.com
              </span>
            </NavLink>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 py-6 border-y border-[#5a4f99]/30">
          <div className="flex items-center gap-3 text-sm font-sans text-[#a5b4fc]">
            <Truck className="w-5 h-5 text-[#7ec8a3] flex-shrink-0" aria-hidden="true" />
            <span>Livraison rapide en France</span>
          </div>
          <div className="flex items-center gap-3 text-sm font-sans text-[#a5b4fc]">
            <Shield className="w-5 h-5 text-[#7ec8a3] flex-shrink-0" aria-hidden="true" />
            <span>Paiement sécurisé en ligne</span>
          </div>
          <div className="flex items-center gap-3 text-sm font-sans text-[#a5b4fc]">
            <CreditCard className="w-5 h-5 text-[#7ec8a3] flex-shrink-0" aria-hidden="true" />
            <span>CB, Apple Pay, Google Pay</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs font-sans text-[#c4b5fd]">
          <p className="flex items-center gap-2">
            <MapPin className="w-3 h-3" aria-hidden="true" />
            <span>Projet étudiant — Ynov B3 DEV — Paris, France</span>
          </p>
          <p>© {year} PokéStore. Pokémon™ © Nintendo / Game Freak. Projet à but pédagogique.</p>
        </div>
      </div>
    </footer>
  );
}
