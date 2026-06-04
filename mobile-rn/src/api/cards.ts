import { fetchJson } from './http';

/** Même forme que la réponse Nest pour `GET /api/cards`. */
export interface CardsApiResponse {
  items: Record<string, unknown>[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ShopMeta {
  series: string[];
  years: number[];
  sets: { id: string; name: string }[];
  priceMin: number;
  priceMax: number;
}

/** Comme `buildCardsQuery` dans `frontend/src/Pages/Shop.tsx`. */
export function buildCardsQuery(params: Record<string, string>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v.trim() !== '') {
      sp.set(k, v.trim());
    }
  });
  const q = sp.toString();
  return q ? `?${q}` : '';
}

export async function fetchCards(filters: Record<string, string>) {
  const qs = buildCardsQuery(filters);
  return fetchJson<CardsApiResponse | Record<string, unknown>[]>(`/cards${qs}`);
}

export function fetchShopMeta() {
  return fetchJson<ShopMeta>('/cards/meta');
}
