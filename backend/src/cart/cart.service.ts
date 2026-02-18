import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
    constructor(private prisma: PrismaService) { }

    async getOrCreateCart(userId: number) {
        // Chercher un panier actif
        let cart = await this.prisma.cart.findFirst({
            where: { userId, status: 'ACTIVE' },
            include: {
                items: {
                    include: {
                        card: true,
                    },
                },
            },
        });

        // Si pas de panier actif, en créer un
        if (!cart) {
            cart = await this.prisma.cart.create({
                data: {
                    userId,
                    status: 'ACTIVE',
                },
                include: {
                    items: {
                        include: {
                            card: true,
                        },
                    },
                },
            });
        }

        return cart;
    }

    async addToCart(userId: number, addToCartDto: AddToCartDto) {
        const { cardId, quantity } = addToCartDto;

        // Vérifier que la carte existe
        const card = await this.prisma.pokemonCard.findUnique({
            where: { id: cardId },
        });

        if (!card) {
            throw new NotFoundException('Carte non trouvée');
        }

        // Récupérer ou créer le panier
        const cart = await this.getOrCreateCart(userId);

        // Vérifier si l'article est déjà dans le panier
        const existingItem = await this.prisma.cartItem.findUnique({
            where: {
                cartId_cardId: {
                    cartId: cart.id,
                    cardId,
                },
            },
        });

        if (existingItem) {
            // Mettre à jour la quantité
            await this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
        } else {
            // Ajouter un nouvel article
            await this.prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    cardId,
                    quantity,
                },
            });
        }

        // Retourner le panier mis à jour
        return this.getOrCreateCart(userId);
    }

    async updateCartItem(userId: number, cardId: number, updateCartItemDto: UpdateCartItemDto) {
        const { quantity } = updateCartItemDto;

        const cart = await this.getOrCreateCart(userId);

        const cartItem = await this.prisma.cartItem.findUnique({
            where: {
                cartId_cardId: {
                    cartId: cart.id,
                    cardId,
                },
            },
        });

        if (!cartItem) {
            throw new NotFoundException('Article non trouvé dans le panier');
        }

        await this.prisma.cartItem.update({
            where: { id: cartItem.id },
            data: { quantity },
        });

        return this.getOrCreateCart(userId);
    }

    async removeFromCart(userId: number, cardId: number) {
        const cart = await this.getOrCreateCart(userId);

        const cartItem = await this.prisma.cartItem.findUnique({
            where: {
                cartId_cardId: {
                    cartId: cart.id,
                    cardId,
                },
            },
        });

        if (!cartItem) {
            throw new NotFoundException('Article non trouvé dans le panier');
        }

        await this.prisma.cartItem.delete({
            where: { id: cartItem.id },
        });

        return this.getOrCreateCart(userId);
    }

    async clearCart(userId: number) {
        const cart = await this.getOrCreateCart(userId);

        await this.prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });

        return this.getOrCreateCart(userId);
    }

    async getCart(userId: number) {
        return this.getOrCreateCart(userId);
    }
}
