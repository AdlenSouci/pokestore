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
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onViewCard?.(product)}
        style={{
          perspective: '1000px',
          width: '100%',
          maxWidth: '280px',
        }}
      >
        <div
          className="relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 border-4 border-[#2d3561]"
          style={{
            transform: isHovered
              ? 'rotateY(15deg) rotateX(10deg) scale(1.05)'
              : 'rotateY(0deg) rotateX(0deg) scale(1)',
            transformStyle: 'preserve-3d',
            aspectRatio: '63/88',
          }}
        >
          <img
            src={product.image}
            alt={product.name}
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
                <div className="flex items-center gap-2 px-6 py-3 bg-[#7ec8a3] rounded-full border-3 border-white shadow-2xl">
                  <Eye className="w-6 h-6 text-white" />
                  <span className="font-bold text-white text-lg">VIEW CARD</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="text-center w-full max-w-[280px]">
        <h3 className="text-white font-bold mb-1 drop-shadow-sm">{product.name}</h3>
        <p className="text-[#e0e7ff] text-sm mb-1 font-medium">
          {product.category} — {product.rarity}
        </p>
        <div className="text-2xl font-bold text-[#7ec8a3] mb-3 tabular-nums">
          {Number.isFinite(product.price) ? `${product.price.toFixed(2)} €` : '—'}
        </div>
        
        <button
          onClick={() => onAddToCart(product)}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5a4f99] to-[#2d3561] text-white rounded-2xl hover:from-[#6a5fa9] hover:to-[#3d4571] transition-all transform hover:scale-105 active:scale-95 shadow-lg border-2 border-[#2d3561]"
        >
          <ShoppingCart className="w-5 h-5" />
          Ajouter au panier
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
    </div>
  );
}