import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private ordersService: OrdersService) { }

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
}
