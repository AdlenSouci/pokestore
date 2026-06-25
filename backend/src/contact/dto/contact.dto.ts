export class ContactDto {
  name: string;
  email: string;
  subject: string;
  message: string;
  captchaAnswer: number;
  captchaToken: string;
  /** Champ honeypot — doit rester vide */
  website?: string;
}
