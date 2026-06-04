import type { Product } from '../types/product';

/** Copie logique de `frontend/src/Pages/Shop.tsx` — `mapCardToProduct`. */
export function mapCardToProduct(card: Record<string, unknown>): Product {
  const id = card.id as number;
  const releaseYear = card.releaseYear as number | null | undefined;
  const tcgSetName = (card.tcgSetName as string | null | undefined) ?? '';
  const series = (card.series as string | null | undefined) ?? '';
  const extra = [tcgSetName, series, releaseYear != null ? String(releaseYear) : '']
    .filter(Boolean)
    .join(' · ');

  return {
    id: String(id),
    name: String(card.name),
    description: extra
      ? `Carte ${card.rarity} — ${extra}`
      : `Carte ${card.rarity} de type ${card.type}`,
    price: Number(card.price),
    image: String(card.imageUrl),
    category: String(card.type),
    rarity: String(card.rarity),
    series: (card.series as string | null) ?? null,
    tcgSetName: (card.tcgSetName as string | null) ?? null,
    releaseYear: releaseYear ?? null,
  };
}
