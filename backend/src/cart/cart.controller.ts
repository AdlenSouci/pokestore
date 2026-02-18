import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
    constructor(private cartService: CartService) { }

    @Get()
    async getCart(@Req() req) {
        return this.cartService.getCart(req.user.userId);
    }

    @Post()
    async addToCart(@Req() req, @Body() addToCartDto: AddToCartDto) {
        return this.cartService.addToCart(req.user.userId, addToCartDto);
    }

    @Patch(':cardId')
    async updateCartItem(
        @Req() req,
        @Param('cardId') cardId: string,
        @Body() updateCartItemDto: UpdateCartItemDto,
    ) {
        return this.cartService.updateCartItem(req.user.userId, +cardId, updateCartItemDto);
    }

    @Delete(':cardId')
    async removeFromCart(@Req() req, @Param('cardId') cardId: string) {
        return this.cartService.removeFromCart(req.user.userId, +cardId);
    }

    @Delete()
    async clearCart(@Req() req) {
        return this.cartService.clearCart(req.user.userId);
    }
}
