import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        private cartService: CartService,
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

        // Marquer le panier comme converti et le vider
        await this.prisma.cart.update({
            where: { id: cart.id },
            data: { status: 'CONVERTED' },
        });

        await this.prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });

        return order;
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
}
