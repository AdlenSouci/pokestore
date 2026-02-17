import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { CardsModule } from './cards/cards.module';
// 👇 Import propre depuis le module d'infrastructure
import { PrismaModule } from './database/prisma.module'; 

@Module({
  imports: [
    PrismaModule, 
    UsersModule,
    CardsModule
  ],
})
export class AppModule {}