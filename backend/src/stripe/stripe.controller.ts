import {
  Controller,
  Post,
  Req,
  Headers,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { StripeService } from './stripe.service';
import { PrismaService } from '../database/prisma.service';
import { MailService } from '../mail/mail.service';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import type Stripe from 'stripe';

@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(
    private stripeService: StripeService,
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  @SkipThrottle()
  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Signature Stripe manquante');
    }

    let event: Stripe.Event;

    try {
      event = this.stripeService.constructWebhookEvent(
        req.rawBody ?? Buffer.from(''),
        signature,
      );
    } catch (err) {
      this.logger.error(`❌ Webhook invalide: ${err}`);
      throw new BadRequestException(`Webhook invalide: ${err}`);
    }

    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = parseInt(
        session.metadata?.orderId ?? session.client_reference_id ?? '0',
      );

      if (orderId) {
        const updated = await this.prisma.order.updateMany({
          where: {
            id: orderId,
            status: { not: 'PAID' },
          },
          data: { status: 'PAID' },
        });

        const order = await this.prisma.order.findUnique({
          where: { id: orderId },
          include: {
            items: { include: { card: true } },
            user: true,
          },
        });

        if (!order) {
          this.logger.warn(`⚠️ Commande #${orderId} introuvable`);
          return { received: true };
        }

        if (updated.count === 0) {
          this.logger.log(`ℹ️ Commande #${orderId} déjà marquée PAID`);
          return { received: true };
        }

        this.logger.log(`✅ Commande #${orderId} marquée PAID via webhook`);

        // Envoyer l'email de confirmation
        if (order.user) {
          await this.mailService.sendOrderConfirmation(
            order.user.email,
            order.user.name ?? 'Dresseur',
            order.id,
            order.items.map((item) => ({
              name: item.card.name,
              quantity: item.quantity,
              price: item.price,
            })),
            order.total,
          );
        }
      }
    }

    return { received: true };
  }
}
