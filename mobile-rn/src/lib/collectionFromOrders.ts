import { mapCardToProduct } from './mapCard';
import type { Order } from '../types/order';
import type { Product } from '../types/product';

export interface CollectionEntry {
  product: Product;
  quantity: number;
}

/** Agrège les cartes des commandes payées en une collection unique. */
export function buildCollectionFromOrders(orders: Order[]): CollectionEntry[] {
  const map = new Map<number, CollectionEntry>();

  for (const order of orders) {
    if (order.status !== 'PAID') continue;
    for (const item of order.items) {
      const product = mapCardToProduct(item.card as unknown as Record<string, unknown>);
      const existing = map.get(item.cardId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        map.set(item.cardId, { product, quantity: item.quantity });
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => a.product.name.localeCompare(b.product.name, 'fr'));
}
