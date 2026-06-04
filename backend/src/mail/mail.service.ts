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
      secure: false, // TLS
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

      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM') ?? '"PokéStore" <noreply@pokestore.dev>',
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

      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM') ?? '"PokéStore" <noreply@pokestore.dev>',
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
}
