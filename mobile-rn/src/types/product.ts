/** Même contrat que `frontend/src/types/product.ts`. */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rarity: string;
  series?: string | null;
  tcgSetName?: string | null;
  releaseYear?: number | null;
}
