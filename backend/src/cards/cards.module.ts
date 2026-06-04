import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { PrismaModule } from '../database/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [CardsService],
  controllers: [CardsController],
})
export class CardsModule {}
