import { X, ShoppingCart } from "lucide-react";
import { type Product } from "../types/product";
import { TestEffect } from "./TestEffect";
import { useState, useRef, type MouseEvent } from "react";

interface CardDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export function CardDetailModal({ product, onClose, onAddToCart }: CardDetailModalProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!product) return null;

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

  // Fonction pour traduire le type de la DB (Anglais) vers l'effet (Code)
  const getAnimationType = (category: string) => {
    const type = category.toLowerCase();
    
    if (type.includes('water') || type.includes('eau')) return 'water';
    if (type.includes('fire') || type.includes('feu')) return 'fire';
    if (type.includes('lightning') || type.includes('electric')) return 'electric';
    if (type.includes('psychic') || type.includes('psy')) return 'psy';
    if (type.includes('flying') || type.includes('colorless') || type.includes('normal')) return 'flying';
    if (type.includes('dragon')) return 'dragon';
    
    return null; // Pas d'effet pour les autres types
  };

  const effectType = getAnimationType(product.category);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl h-[90vh] flex items-center justify-center px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-3 bg-[#2d3561] text-white rounded-full hover:bg-[#3d4571] transition-all shadow-lg border-2 border-white"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="relative flex flex-col items-center justify-center">
          
          {/* Affichage dynamique de l'effet basé sur le type traduit */}
          {effectType && (
            <div className="fixed inset-0 z-0">
              <TestEffect type={effectType as any} />
            </div>
          )}

          <div className="relative z-10" style={{ width: '700px', height: '800px' }}>
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ zIndex: 10 }}
            >
              <div
                ref={cardRef}
                className="relative"
                style={{
                  perspective: '1500px',
                  width: '350px',
                }}
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
                  <img
                    src={cardImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />

                  <div
                    className="absolute inset-0 opacity-40 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(135deg, transparent 20%, rgba(255,255,255,0.9) 50%, transparent 80%)',
                      animation: 'shine 3s infinite',
                    }}
                  />
                  <div
                    className="absolute inset-0 opacity-30 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(45deg, #5a4f99, #7ec8a3, #8b7ec8, #5a4f99)',
                      backgroundSize: '200% 200%',
                      animation: 'rainbow 4s ease infinite',
                      mixBlendMode: 'color-dodge',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center bg-[#2d3561]/90 backdrop-blur-sm rounded-2xl p-6 border-4 border-white max-w-md relative z-10">
            <h2 className="text-white text-3xl mb-2">{product.name}</h2>
            <p className="text-[#7ec8a3] text-lg mb-4">
              {product.category} - {product.rarity}
            </p>
            <div className="text-4xl text-white mb-6">
              {product.price.toFixed(2)}€
            </div>

            <button
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#7ec8a3] to-[#5a4f99] text-white text-lg font-bold rounded-2xl hover:from-[#8ed3b3] hover:to-[#6a5fa9] transition-all transform hover:scale-105 active:scale-95 shadow-xl border-3 border-white"
            >
              <ShoppingCart className="w-6 h-6" />
              Ajouter au panier
            </button>
          </div>
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