import { useEffect, useMemo, useState } from 'react';
import { LayoutGrid, ShoppingBag } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { SEO } from '../components/SEO';
import { buildCollectionFromOrders } from '../lib/collectionFromOrders';
import { orderService } from '../services/order.service';
import { type Product } from '../types/product';

interface CollectionProps {
  user: { name: string; email: string } | null;
  onLoginClick: () => void;
  onNavigateToShop: () => void;
  onViewCard: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export function Collection({
  user,
  onLoginClick,
  onNavigateToShop,
  onViewCard,
  onAddToCart,
}: CollectionProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof orderService.getOrders>>>([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await orderService.getOrders();
        if (!cancelled) setOrders(data);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erreur de chargement');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const collection = useMemo(() => buildCollectionFromOrders(orders), [orders]);
  const totalCards = useMemo(
    () => collection.reduce((sum, e) => sum + e.quantity, 0),
    [collection],
  );

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <SEO title="Ma collection – PokéStore" description="Retrouve les cartes Pokémon que tu as achetées." />
        <LayoutGrid className="w-16 h-16 text-[#7ec8a3] mx-auto mb-6" aria-hidden="true" />
        <h1 className="text-3xl pixel-font text-white mb-4">Ma collection</h1>
        <p className="text-[#a5b4fc] mb-8 font-sans max-w-md mx-auto">
          Connecte-toi pour voir toutes les cartes que tu as achetées sur PokéStore.
        </p>
        <button
          type="button"
          onClick={onLoginClick}
          className="px-8 py-3 bg-[#7ec8a3] text-[#1a1f3a] font-bold rounded-xl border-2 border-[#2d3561] hover:bg-[#6eb893] transition focus-visible:ring-2 focus-visible:ring-white"
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div className="relative z-10 container mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-24">
      <SEO
        title="Ma collection – PokéStore"
        description="Toutes les cartes Pokémon que tu as achetées, avec les mêmes effets visuels que la boutique."
        url="https://pokestore-hazel.vercel.app/collection"
      />

      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 pixel-font text-white flex items-center justify-center gap-3">
          <LayoutGrid className="w-8 h-8 text-[#7ec8a3]" aria-hidden="true" />
          Ma collection
        </h1>
        {!loading && collection.length > 0 && (
          <p className="text-[#a5b4fc] text-sm md:text-base font-sans">
            {collection.length} carte{collection.length > 1 ? 's uniques' : ' unique'} · {totalCards} au total
          </p>
        )}
        <p className="text-[#a5b4fc]/80 text-sm font-sans mt-2">
          Cartes issues de tes commandes payées — clique pour l&apos;effet 3D et les animations de type.
        </p>
      </div>

      {error && (
        <div role="alert" className="mb-6 bg-red-500 text-white p-4 rounded-xl text-center font-bold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="text-[#7ec8a3] text-xl pixel-font animate-pulse" role="status">
            Chargement de ta collection…
          </div>
        </div>
      ) : collection.length === 0 ? (
        <div className="text-center py-16">
          <LayoutGrid className="w-20 h-20 text-[#5a4f99] mx-auto mb-4 opacity-60" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-white mb-2">Collection vide</h2>
          <p className="text-[#a5b4fc] mb-8 font-sans">
            Achète des cartes dans la boutique pour les retrouver ici.
          </p>
          <button
            type="button"
            onClick={onNavigateToShop}
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#2d3561] text-white font-bold rounded-xl border-2 border-[#5a4f99] hover:bg-[#3d4571] transition focus-visible:ring-2 focus-visible:ring-[#7ec8a3]"
          >
            <ShoppingBag className="w-5 h-5" aria-hidden="true" />
            Aller à la boutique
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 lg:gap-6">
          {collection.map((entry) => (
            <ProductCard
              key={entry.product.id}
              product={entry.product}
              quantity={entry.quantity}
              onViewCard={onViewCard}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}
