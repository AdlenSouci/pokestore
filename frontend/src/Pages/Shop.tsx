import { useEffect, useState } from 'react';
import { type Product } from '../types/product';
import { ProductCard } from '../components/ProductCard';

interface ShopProps {
  onAddToCart: (product: Product) => void;
  onViewCard: (product: Product) => void;
}

export function Shop({ onAddToCart, onViewCard }: ShopProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // On appelle ton backend NestJS (port 3000 par défaut)
    fetch('http://localhost:3000/cards') 
      .then((res) => {
        if (!res.ok) {
          throw new Error('Erreur réseau');
        }
        return res.json();
      })
      .then((data) => {
        // On transforme les données du backend pour qu'elles collent au format du frontend
        // data est un tableau d'objets venant de Prisma
        const formattedProducts: Product[] = data.map((card: any) => ({
          id: card.id.toString(), // Prisma renvoie un Int, on le veut en String
          name: card.name,
          description: `Carte ${card.rarity} de type ${card.type}`, // Description générée
          price: card.price,
          image: card.imageUrl, // Mapping: imageUrl (DB) -> image (Frontend)
          category: card.type,  // Mapping: type (DB) -> category (Frontend)
          rarity: card.rarity,
        }));

        setProducts(formattedProducts);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des cartes:", err);
        setError("Impossible de charger les cartes Pokémon.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-[#7ec8a3] text-xl pixel-font animate-pulse">
          CHARGEMENT DU POKÉDEX...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-red-500 text-xl pixel-font text-center px-4">
          ERREUR: {error}<br/>
          <span className="text-sm text-white mt-2 block font-sans">Vérifie que le backend tourne sur le port 3000</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="mb-8 text-center">
        <h2 className="text-[#2d3561] text-4xl font-bold mb-2 pixel-font">🎮 Cartes Pokémon Rares 🎮</h2>
        <p className="text-[#a5b4fc]">
          Découvrez notre collection importée directement de la base de données !
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onViewCard={onViewCard}
          />
        ))}
      </div>
    </div>
  );
}