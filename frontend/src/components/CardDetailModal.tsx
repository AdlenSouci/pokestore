import { X, ShoppingCart } from 'lucide-react';
import { type Product } from '../types/product';
import { TestEffect } from './TestEffect';
import { useState, useRef, type MouseEvent } from 'react';
import { ModalShell, useDialogTitleId } from './ModalShell';

interface CardDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

function CardDetailContent({
  product,
  onClose,
  onAddToCart,
}: {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}) {
  const titleId = useDialogTitleId();
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const cardImage = product.image;

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateXValue = ((y - centerY) / centerY) * -30;
    const rotateYValue = ((x - centerX) / centerX) * 30;
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const getAnimationType = (category: string) => {
    const type = category.toLowerCase();

    if (type.includes('water') || type.includes('eau')) return 'water';
    if (type.includes('fire') || type.includes('feu')) return 'fire';
    if (type.includes('lightning') || type.includes('electric')) return 'electric';
    if (type.includes('psychic') || type.includes('psy')) return 'psy';
    if (type.includes('flying') || type.includes('colorless') || type.includes('normal')) return 'flying';
    if (type.includes('dragon')) return 'dragon';

    return null;
  };

  const effectType = getAnimationType(product.category);

  return (
    <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto flex flex-col items-center justify-center px-4 py-8">
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer le détail de la carte"
        className="absolute top-4 right-4 z-20 p-3 bg-[#2d3561] text-white rounded-full hover:bg-[#3d4571] transition-all shadow-lg border-2 border-white focus-visible:ring-2 focus-visible:ring-[#7ec8a3]"
      >
        <X className="w-6 h-6" aria-hidden="true" />
      </button>

      <div className="relative flex flex-col items-center justify-center w-full">
        {effectType && (
          <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
            <TestEffect type={effectType as 'water' | 'fire' | 'electric' | 'psy' | 'flying' | 'dragon'} />
          </div>
        )}

        <div className="relative z-10 w-full max-w-[700px]" style={{ minHeight: 'min(80vw, 500px)' }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 10 }}>
            <div
              ref={cardRef}
              className="relative mx-auto"
              style={{ perspective: '1500px', width: 'min(350px, 80vw)' }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div
                className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-[#2d3561]"
                style={{
                  transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                  transformStyle: 'preserve-3d',
                  aspectRatio: '63/88',
                  transition: 'transform 0.1s ease-out',
                }}
              >
                <img src={cardImage} alt="" className="w-full h-full object-cover" aria-hidden="true" />
                <div
                  className="absolute inset-0 opacity-40 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(135deg, transparent 20%, rgba(255,255,255,0.9) 50%, transparent 80%)',
                    animation: 'shine 3s infinite',
                  }}
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{
                    background: 'linear-gradient(45deg, #5a4f99, #7ec8a3, #8b7ec8, #5a4f99)',
                    backgroundSize: '200% 200%',
                    animation: 'rainbow 4s ease infinite',
                    mixBlendMode: 'color-dodge',
                  }}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center bg-[#2d3561]/90 backdrop-blur-sm rounded-2xl p-6 border-4 border-white max-w-md relative z-10 w-full">
          <h2 id={titleId} className="text-white text-3xl mb-2">
            {product.name}
          </h2>
          <p className="text-[#7ec8a3] text-lg mb-4">
            {product.category} - {product.rarity}
          </p>
          <div className="text-4xl text-[#7ec8a3] font-bold mb-6 tabular-nums">
            {Number.isFinite(product.price) ? `${product.price.toFixed(2)} €` : '—'}
          </div>

          <button
            type="button"
            onClick={() => {
              onAddToCart(product);
              onClose();
            }}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#7ec8a3] to-[#5a4f99] text-white text-lg font-bold rounded-2xl hover:from-[#8ed3b3] hover:to-[#6a5fa9] transition-all transform hover:scale-105 active:scale-95 shadow-xl border-3 border-white focus-visible:ring-2 focus-visible:ring-white"
            aria-label={`Ajouter ${product.name} au panier`}
          >
            <ShoppingCart className="w-6 h-6" aria-hidden="true" />
            Ajouter au panier
          </button>
        </div>
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

export function CardDetailModal({ product, onClose, onAddToCart }: CardDetailModalProps) {
  if (!product) return null;

  return (
    <ModalShell onClose={onClose}>
      <CardDetailContent product={product} onClose={onClose} onAddToCart={onAddToCart} />
    </ModalShell>
  );
}
