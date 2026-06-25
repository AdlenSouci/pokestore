import { API_URL } from '../lib/api';

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

class ContactService {
  async getCaptcha(): Promise<CaptchaChallenge> {
    const res = await fetch(`${API_URL}/contact/captcha`);
    if (!res.ok) throw new Error('Impossible de charger le captcha');
    return res.json();
  }

  async sendMessage(payload: ContactPayload): Promise<void> {
    const res = await fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Erreur lors de l'envoi du message");
    }
  }
}

export const contactService = new ContactService();
