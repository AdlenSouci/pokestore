import { useEffect, useRef, useState } from 'react';
import { API_URL } from '../lib/api';
import type { Product } from '../types/product';
import './ShopShowcase.css';

interface ShopShowcaseProps {
  onGoToShop: () => void;
}

function mapCard(card: Record<string, unknown>): Product {
  return {
    id: String(card.id),
    name: String(card.name),
    description: String(card.rarity),
    price: Number(card.price),
    image: String(card.imageUrl),
    category: String(card.type),
    rarity: String(card.rarity),
    series: (card.series as string | null) ?? null,
    tcgSetName: (card.tcgSetName as string | null) ?? null,
    releaseYear: (card.releaseYear as number | null) ?? null,
  };
}

function CardStrip({
  products,
  direction,
  speed,
}: {
  products: Product[];
  direction: 'left' | 'right';
  speed: number;
}) {
  const doubled = [...products, ...products];

  return (
    <div className="shop-showcase__strip-mask" aria-hidden="true">
      <div
        className={`shop-showcase__strip shop-showcase__strip--${direction}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {doubled.map((p, i) => (
          <div key={`${p.id}-${i}`} className="shop-showcase__card">
            <img src={p.image} alt="" loading="lazy" draggable={false} />
            <span className="shop-showcase__card-name">{p.name}</span>
            <span className="shop-showcase__card-price">{p.price.toFixed(2)} €</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ShopShowcase({ onGoToShop }: ShopShowcaseProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [parallaxY, setParallaxY] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/cards?pageSize=14&page=1`);
        if (!res.ok) return;
        const raw = await res.json();
        const items = Array.isArray(raw) ? raw : (raw.items ?? []);
        if (!cancelled && items.length > 0) {
          setProducts(items.map((c: Record<string, unknown>) => mapCard(c)));
        }
      } catch {
        /* démo optionnelle */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < 0 || rect.top > vh) return;
      const progress = 1 - rect.top / vh;
      setParallaxY(progress * 80);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (products.length === 0) {
    return null;
  }

  const rowA = products.slice(0, Math.ceil(products.length / 2));
  const rowB = products.slice(Math.ceil(products.length / 2));

  return (
    <section
      id="shop-showcase"
      ref={sectionRef}
      className="shop-showcase relative overflow-hidden py-16 md:py-24 border-t-4 border-[#2d3561]"
      aria-labelledby="shop-showcase-title"
    >
      <div
        className="shop-showcase__layer shop-showcase__layer--back"
        style={{ transform: `translateY(${parallaxY * 0.25}px)` }}
        aria-hidden="true"
      />
      <div
        className="shop-showcase__layer shop-showcase__layer--mid"
        style={{ transform: `translateY(${parallaxY * 0.45}px)` }}
        aria-hidden="true"
      />

      <div className="relative z-10 container mx-auto px-4 mb-10 text-center">
        <p className="text-[#7ec8a3] text-xs font-sans font-bold uppercase tracking-[0.2em] mb-2">
          Aperçu
        </p>
        <h2 id="shop-showcase-title" className="text-white text-xl md:text-2xl font-bold pixel-font mb-3">
          La boutique en mouvement
        </h2>
        <p className="text-[#c4b5fd] font-sans text-sm md:text-base max-w-lg mx-auto mb-6">
          Défilement automatique des cartes — filtres, panier et paiement dans la vraie boutique.
        </p>
        <button
          type="button"
          onClick={onGoToShop}
          className="px-8 py-3 bg-[#7ec8a3] text-[#1a1f3a] rounded-xl border-2 border-[#2d3561] font-bold font-sans hover:bg-[#6eb893] transition transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-[#7ec8a3]"
        >
          Ouvrir la boutique
        </button>
      </div>

      <div
        className="relative z-10 space-y-6"
        style={{ transform: `translateY(${parallaxY * -0.15}px)` }}
      >
        <CardStrip products={rowA} direction="left" speed={38} />
        <CardStrip products={rowB.length ? rowB : rowA} direction="right" speed={44} />
      </div>
    </section>
  );
}
