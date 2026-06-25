import { useState } from 'react';
import { type Product } from '../types/product'; // Ajout de "type" ici
import { ShoppingCart, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewCard?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart, onViewCard }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <article className="flex flex-col h-full bg-gradient-to-b from-[#3d4571]/40 to-[#2d3561]/50 rounded-2xl border-2 border-[#5a4f99]/40 p-3 sm:p-4 transition-shadow hover:shadow-2xl hover:border-[#7ec8a3]/60">
      <div
        className="relative cursor-pointer w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onViewCard?.(product)}
        style={{ perspective: '1000px' }}
      >
        <div
          className="relative rounded-xl overflow-hidden shadow-xl transition-all duration-500 border-2 sm:border-4 border-[#2d3561] w-full aspect-[63/88]"
          style={{
            transform: isHovered
              ? 'rotateY(10deg) rotateX(6deg) scale(1.03)'
              : 'rotateY(0deg) rotateX(0deg) scale(1)',
            transformStyle: 'preserve-3d',
          }}
        >
          <img
            src={product.image}
            alt={`Carte Pokémon ${product.name} - ${product.rarity}`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />

          {isHovered && (
            <>
              <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(135deg, transparent 20%, rgba(255,255,255,0.9) 50%, transparent 80%)',
                  animation: 'shine 2s infinite',
                }}
              />
              <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(45deg, #5a4f99, #7ec8a3, #8b7ec8, #5a4f99)',
                  backgroundSize: '200% 200%',
                  animation: 'rainbow 3s ease infinite',
                  mixBlendMode: 'color-dodge',
                }}
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                <div className="flex items-center gap-2 px-3 py-2 sm:px-5 sm:py-2.5 bg-[#7ec8a3] rounded-full border-2 border-white shadow-2xl">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  <span className="font-bold text-white text-xs sm:text-sm uppercase">Voir</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="text-center w-full flex flex-col flex-1 pt-3 sm:pt-4">
        <h3 className="text-white font-bold text-sm sm:text-base mb-1 line-clamp-2 drop-shadow-sm">
          {product.name}
        </h3>
        <p className="text-[#e0e7ff] text-xs sm:text-sm mb-1 font-medium opacity-80">
          {product.category} — {product.rarity}
        </p>
        <div className="text-lg sm:text-2xl font-bold text-[#7ec8a3] mb-3 tabular-nums">
          {Number.isFinite(product.price) ? `${product.price.toFixed(2)} €` : '—'}
        </div>

        <button
          onClick={() => onAddToCart(product)}
          className="mt-auto w-full flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-[#5a4f99] to-[#2d3561] text-white rounded-xl hover:from-[#6a5fa9] hover:to-[#3d4571] transition-all transform hover:scale-105 active:scale-95 shadow-lg border-2 border-[#2d3561] text-xs sm:text-sm font-semibold"
          aria-label={`Ajouter ${product.name} au panier`}
        >
          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          <span className="hidden sm:inline">Ajouter au panier</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(30deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(30deg); }
        }
        @keyframes rainbow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </article>
  );
}