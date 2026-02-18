import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { CardsModule } from './cards/cards.module';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
// 👇 Import propre depuis le module d'infrastructure
import { PrismaModule } from './database/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Rend les variables d'environnement disponibles partout
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CardsModule,
    CartModule,
    OrdersModule,
  ],
})
export class AppModule { }