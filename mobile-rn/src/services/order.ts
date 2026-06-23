import { fetchJson } from '../api/http';
import { getWebReturnUrl } from '../config/api';

/** Session Stripe Checkout — envoie l’URL de retour pour que le paiement revienne dans l’app. */
export async function createCheckoutSession(): Promise<{ url: string }> {
  return fetchJson<{ url: string }>('/orders/checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ returnBaseUrl: getWebReturnUrl() }),
  });
}

export async function confirmPayment(sessionId: string): Promise<unknown> {
  return fetchJson('/orders/confirm-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });
}
