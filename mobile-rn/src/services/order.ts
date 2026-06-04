import { fetchJson } from '../api/http';

/** Comme `frontend/src/services/order.service.ts` — session Stripe. */
export async function createCheckoutSession(): Promise<{ url: string }> {
  return fetchJson<{ url: string }>('/orders/checkout-session', {
    method: 'POST',
  });
}
