import { fetchJson } from '../api/http';

/** Aligné sur `frontend/src/services/cart.service.ts`. */
export interface CartItem {
  id: number;
  cardId: number;
  quantity: number;
  card: {
    id: number;
    name: string;
    type: string;
    rarity: string;
    imageUrl: string;
    price: number;
  };
}

export interface Cart {
  id: number;
  userId: number;
  status: string;
  items: CartItem[];
}

export async function getCart(): Promise<Cart> {
  return fetchJson<Cart>('/cart');
}

export async function addToCart(cardId: number, quantity: number = 1): Promise<Cart> {
  return fetchJson<Cart>('/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cardId, quantity }),
  });
}

export async function updateCartItem(cardId: number, quantity: number): Promise<Cart> {
  return fetchJson<Cart>(`/cart/${cardId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  });
}

export async function removeFromCart(cardId: number): Promise<Cart> {
  return fetchJson<Cart>(`/cart/${cardId}`, {
    method: 'DELETE',
  });
}
