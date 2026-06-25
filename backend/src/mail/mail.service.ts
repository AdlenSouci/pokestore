import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST') ?? 'smtp.gmail.com',
      port: parseInt(this.configService.get<string>('MAIL_PORT') ?? '587'),
      secure: false,
      connectionTimeout: 8_000,
      greetingTimeout: 8_000,
      socketTimeout: 10_000,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  private loadTemplate(templateName: string): string {
    // En dev (ts-node) : src/mail/templates/
    // En prod (compilé) : dist/mail/templates/ (copié par nest-cli.json)
    const candidates = [
      path.join(__dirname, 'templates', `${templateName}.html`),
      path.join(process.cwd(), 'src', 'mail', 'templates', `${templateName}.html`),
      path.join(process.cwd(), 'dist', 'mail', 'templates', `${templateName}.html`),
    ];

    for (const templatePath of candidates) {
      if (fs.existsSync(templatePath)) {
        this.logger.log(`📄 Template trouvé : ${templatePath}`);
        return fs.readFileSync(templatePath, 'utf-8');
      }
    }

    const tried = candidates.join(', ');
    throw new Error(`Template "${templateName}" introuvable. Chemins essayés : ${tried}`);
  }

  private renderTemplate(
    template: string,
    variables: Record<string, string>,
  ): string {
    let rendered = template;
    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replaceAll(`{{${key}}}`, value);
    }
    return rendered;
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    try {
      const template = this.loadTemplate('welcome');
      const html = this.renderTemplate(template, { userName, userEmail });

      await this.deliver({
        to: userEmail,
        subject: '⚡ Bienvenue sur PokéStore, Dresseur !',
        html,
      });

      this.logger.log(`✅ Email de bienvenue envoyé à ${userEmail}`);
    } catch (error) {
      this.logger.error(`❌ Erreur envoi email bienvenue: ${(error as Error).message}`);
      this.logger.error((error as Error).stack ?? '');
    }
  }

  async sendOrderConfirmation(
    userEmail: string,
    userName: string,
    orderId: number,
    items: Array<{ name: string; quantity: number; price: number }>,
    total: number,
  ): Promise<void> {
    try {
      const template = this.loadTemplate('order-confirmation');

      const itemsRows = items
        .map(
          (item) => `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #2d2d5e;">${item.name}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #2d2d5e; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #2d2d5e; text-align: right; color: #f9d342;">${(item.price * item.quantity).toFixed(2)} €</td>
        </tr>`,
        )
        .join('');

      const html = this.renderTemplate(template, {
        userName,
        orderId: orderId.toString(),
        itemsRows,
        total: total.toFixed(2),
      });

      await this.deliver({
        to: userEmail,
        subject: `🎴 Commande #${orderId} confirmée — PokéStore`,
        html,
      });

      this.logger.log(`✅ Email de commande #${orderId} envoyé à ${userEmail}`);
    } catch (error) {
      this.logger.error(`❌ Erreur envoi email commande: ${(error as Error).message}`);
      this.logger.error((error as Error).stack ?? '');
    }
  }

  async sendContactEmail(payload: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<void> {
    const to =
      this.configService.get<string>('CONTACT_TO') ??
      this.configService.get<string>('MAIL_USER') ??
      'contact@pokestore.dev';

    const escaped = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const html = `
      <div style="font-family:Arial,sans-serif;background:#1a1f3a;color:#fff;padding:24px;">
        <h2 style="color:#7ec8a3;">📬 Nouveau message — PokéStore</h2>
        <p><strong>De :</strong> ${escaped(payload.name)} &lt;${escaped(payload.email)}&gt;</p>
        <p><strong>Sujet :</strong> ${escaped(payload.subject)}</p>
        <div style="background:#2d3561;padding:16px;border-radius:8px;margin-top:16px;white-space:pre-wrap;">${escaped(payload.message)}</div>
      </div>`;

    await this.deliver({
      to,
      replyTo: `${payload.name} <${payload.email}>`,
      subject: `[PokéStore Contact] ${payload.subject}`,
      html,
      text: `De: ${payload.name} <${payload.email}>\nSujet: ${payload.subject}\n\n${payload.message}`,
    });

    this.logger.log(`✅ Email contact envoyé à ${to} (de ${payload.email})`);
  }

  /** Resend (HTTPS) en prod Render — SMTP Gmail bloqué sur le plan gratuit. */
  private async deliver(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    replyTo?: string;
  }): Promise<void> {
    const resendKey = this.configService.get<string>('RESEND_API_KEY')?.trim();
    if (resendKey) {
      await this.sendViaResend(resendKey, options);
      return;
    }

    await this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_FROM') ?? '"PokéStore" <noreply@pokestore.dev>',
      to: options.to,
      replyTo: options.replyTo,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }

  private async sendViaResend(
    apiKey: string,
    options: { to: string; subject: string; html: string; text?: string; replyTo?: string },
  ): Promise<void> {
    const from =
      this.configService.get<string>('RESEND_FROM')?.trim() ??
      'PokéStore <onboarding@resend.dev>';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend ${res.status}: ${body}`);
    }
  }
}
