import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CartService } from '../cart/cart.service';
import { MailService } from '../mail/mail.service';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        private cartService: CartService,
        private mailService: MailService,
        private stripeService: StripeService,
    ) { }

    async createOrder(userId: number) {
        // Récupérer le panier actif
        const cart = await this.cartService.getCart(userId);

        if (!cart.items || cart.items.length === 0) {
            throw new BadRequestException('Le panier est vide');
        }

        // Calculer le total
        const total = cart.items.reduce((sum, item) => {
            return sum + item.card.price * item.quantity;
        }, 0);

        // Créer la commande avec les articles
        const order = await this.prisma.order.create({
            data: {
                userId,
                total,
                status: 'PENDING',
                items: {
                    create: cart.items.map((item) => ({
                        cardId: item.cardId,
                        quantity: item.quantity,
                        price: item.card.price,
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        card: true,
                    },
                },
            },
        });

        // Vider le panier (mais garder le statut ACTIVE pour réutilisation)
        await this.prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });

        // Récupérer l'utilisateur pour l'email
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (user) {
            await this.mailService.sendOrderConfirmation(
                user.email,
                user.name ?? 'Dresseur',
                order.id,
                order.items.map((item) => ({
                    name: item.card.name,
                    quantity: item.quantity,
                    price: item.price,
                })),
                order.total,
            );
        }

        return order;
    }

    async createCheckoutSession(userId: number, returnBaseUrl?: string): Promise<{ url: string }> {
        const cart = await this.cartService.getCart(userId);

        if (!cart.items || cart.items.length === 0) {
            throw new BadRequestException('Le panier est vide');
        }

        const total = cart.items.reduce((sum, item) => {
            return sum + item.card.price * item.quantity;
        }, 0);

        // Créer la commande en PENDING
        const order = await this.prisma.order.create({
            data: {
                userId,
                total,
                status: 'PENDING',
                items: {
                    create: cart.items.map((item) => ({
                        cardId: item.cardId,
                        quantity: item.quantity,
                        price: item.card.price,
                    })),
                },
            },
            include: { items: { include: { card: true } } },
        });

        // Vider le panier
        await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

        // Récupérer l'email utilisateur
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        // Créer la session Stripe Checkout
        const url = await this.stripeService.createCheckoutSession(
            order.id,
            order.items.map((item) => ({
                name: item.card.name,
                price: item.price,
                quantity: item.quantity,
                imageUrl: item.card.imageUrl ?? undefined,
            })),
            user?.email ?? '',
            returnBaseUrl,
        );

        return { url };
    }

    async getOrders(userId: number) {
        return this.prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        card: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async getOrder(userId: number, orderId: number) {
        const order = await this.prisma.order.findFirst({
            where: {
                id: orderId,
                userId,
            },
            include: {
                items: {
                    include: {
                        card: true,
                    },
                },
            },
        });

        if (!order) {
            throw new NotFoundException('Commande non trouvée');
        }

        return order;
    }

    async confirmPayment(userId: number, sessionId: string) {
        if (!sessionId?.trim()) {
            throw new BadRequestException('sessionId manquant');
        }

        const session = await this.stripeService.retrieveCheckoutSession(sessionId.trim());
        const isPaid = session.payment_status === 'paid';
        if (!isPaid) {
            throw new BadRequestException('Le paiement Stripe n’est pas confirmé');
        }

        const orderIdRaw = session.metadata?.orderId ?? session.client_reference_id ?? '';
        const orderId = Number.parseInt(orderIdRaw, 10);
        if (!Number.isInteger(orderId) || orderId <= 0) {
            throw new BadRequestException('orderId invalide dans la session Stripe');
        }

        const ownedOrder = await this.prisma.order.findFirst({
            where: { id: orderId, userId },
        });
        if (!ownedOrder) {
            throw new NotFoundException('Commande introuvable pour cet utilisateur');
        }

        const updateResult = await this.prisma.order.updateMany({
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
            throw new NotFoundException('Commande non trouvée');
        }

        if (updateResult.count > 0 && order.user) {
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

        return order;
    }
}
