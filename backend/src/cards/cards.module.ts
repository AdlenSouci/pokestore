import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { PrismaModule } from '../database/prisma.module';

@Module({
  providers: [CardsService],
  controllers: [CardsController]
})
export class CardsModule {}
