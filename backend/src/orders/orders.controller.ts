import { Controller, Get, Post, Param, UseGuards, Req, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private ordersService: OrdersService) { }

    @Post('checkout-session')
    async createCheckoutSession(
        @Req() req,
        @Body('returnBaseUrl') returnBaseUrl?: string,
    ) {
        return this.ordersService.createCheckoutSession(req.user.userId, returnBaseUrl);
    }

    @Post()
    async createOrder(@Req() req) {
        return this.ordersService.createOrder(req.user.userId);
    }

    @Get()
    async getOrders(@Req() req) {
        return this.ordersService.getOrders(req.user.userId);
    }

    @Get(':id')
    async getOrder(@Req() req, @Param('id') id: string) {
        return this.ordersService.getOrder(req.user.userId, +id);
    }

    @Post('confirm-payment')
    async confirmPayment(@Req() req, @Body('sessionId') sessionId: string) {
        return this.ordersService.confirmPayment(req.user.userId, sessionId);
    }
}
