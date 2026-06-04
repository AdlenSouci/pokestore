import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { CardsModule } from './cards/cards.module';

/**
 * Contexte minimal pour `prisma db seed` (import cartes TCG uniquement).
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CardsModule,
  ],
})
export class SeedAppModule {}
