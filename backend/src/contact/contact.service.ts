import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomInt, timingSafeEqual } from 'crypto';
import { MailService } from '../mail/mail.service';
import { ContactDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  private readonly rateLimit = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  private captchaSecret(): string {
    return (
      this.configService.get<string>('CAPTCHA_SECRET') ??
      this.configService.get<string>('JWT_SECRET') ??
      'pokestore-captcha-dev'
    );
  }

  createCaptchaChallenge(): { question: string; token: string; a: number; b: number } {
    const a = randomInt(2, 12);
    const b = randomInt(2, 12);
    const token = this.signCaptcha(a, b);
    return {
      question: `Combien font ${a} + ${b} ?`,
      token,
      a,
      b,
    };
  }

  private signCaptcha(a: number, b: number): string {
    const payload = `${a}:${b}`;
    return createHmac('sha256', this.captchaSecret()).update(payload).digest('hex');
  }

  private verifyCaptcha(answer: number, token: string): boolean {
    if (!Number.isFinite(answer)) return false;
    for (let a = 2; a < 12; a++) {
      for (let b = 2; b < 12; b++) {
        if (a + b !== answer) continue;
        const expected = this.signCaptcha(a, b);
        try {
          const aBuf = Buffer.from(expected);
          const bBuf = Buffer.from(token);
          if (aBuf.length === bBuf.length && timingSafeEqual(aBuf, bBuf)) {
            return true;
          }
        } catch {
          return false;
        }
      }
    }
    return false;
  }

  private checkRateLimit(ip: string): void {
    const now = Date.now();
    const entry = this.rateLimit.get(ip);
    if (!entry || now > entry.resetAt) {
      this.rateLimit.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
      return;
    }
    entry.count += 1;
    if (entry.count > 8) {
      throw new HttpException('Trop de messages envoyés. Réessayez plus tard.', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  async sendContact(dto: ContactDto, ip: string): Promise<{ success: boolean }> {
    if (dto.website?.trim()) {
      this.logger.warn(`Honeypot déclenché depuis ${ip}`);
      return { success: true };
    }

    this.checkRateLimit(ip);

    const name = dto.name?.trim();
    const email = dto.email?.trim();
    const subject = dto.subject?.trim();
    const message = dto.message?.trim();

    if (!name || name.length < 2) {
      throw new BadRequestException('Nom invalide');
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('Email invalide');
    }
    if (!subject || subject.length < 3) {
      throw new BadRequestException('Sujet invalide');
    }
    if (!message || message.length < 10) {
      throw new BadRequestException('Message trop court (10 caractères minimum)');
    }
    if (message.length > 5000) {
      throw new BadRequestException('Message trop long');
    }

    if (!this.verifyCaptcha(Number(dto.captchaAnswer), dto.captchaToken)) {
      throw new BadRequestException('Captcha incorrect');
    }

    try {
      await this.mailService.sendContactEmail({ name, email, subject, message });
      return { success: true };
    } catch (err) {
      if (err instanceof BadRequestException || err instanceof HttpException) throw err;
      this.logger.error(`Erreur envoi contact: ${(err as Error).message}`);
      throw new BadRequestException("Impossible d'envoyer le message. Réessayez plus tard.");
    }
  }
}
