import { getApiBaseUrl } from '../config/api';

export interface CaptchaChallenge {
  question: string;
  token: string;
}

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  captchaAnswer: number;
  captchaToken: string;
  website?: string;
}

export async function fetchCaptcha(): Promise<CaptchaChallenge> {
  const res = await fetch(`${getApiBaseUrl()}/contact/captcha`);
  if (!res.ok) throw new Error('Impossible de charger le captcha');
  return res.json();
}

export async function sendContactMessage(payload: ContactPayload): Promise<void> {
  const res = await fetch(`${getApiBaseUrl()}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || "Erreur lors de l'envoi");
  }
}
