import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppThrottlerGuard } from './common/app-throttler.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CardsModule } from './cards/cards.module';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './database/prisma.module';
import { MailModule } from './mail/mail.module';
import { StripeModule } from './stripe/stripe.module';
import { ContactModule } from './contact/contact.module';

@Module({
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AppThrottlerGuard,
    },
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 500,
      },
    ]),
    PrismaModule,
    MailModule,
    StripeModule,
    AuthModule,
    UsersModule,
    CardsModule,
    CartModule,
    OrdersModule,
    ContactModule,
  ],
})
export class AppModule { }
