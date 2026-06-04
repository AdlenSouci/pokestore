import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PrismaModule } from '../database/prisma.module';
import { CartModule } from '../cart/cart.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
    imports: [PrismaModule, CartModule, StripeModule],
    controllers: [OrdersController],
    providers: [OrdersService],
})
export class OrdersModule { }
